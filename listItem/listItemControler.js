const MongoDB = require('mongodb');
const Errors = require('../utils/errors');
const Utils = require('../utils/utils');
const Globals = require('../globals');
const ItemSchema = require('../listItemSchema');
const ItemFilter = require('../listItemFilter');

const NodeUtil = require('util');

const listSchema = '{' + Globals.itemIdFieldName + ': objectid, '
                       + Globals.ownerIdFieldName + ': {type: objectid, required}, \
                     rperm:  {type: string, required, lower}, \
                     wperm:  {type: string, required, lower}, \
                     ' + Globals.listSchemaFieldName + ':  {type: schema, lower}}';

class ListItemControler {
  constructor() {
    MongoDB.MongoClient.connect(process.env.MONGODB_ADDRESS, (err, ldb) => {
      if (err) {
        throw new Errors.InternalServerError(Errors.ErrMsg.Database_CouldNotConnect);
      }
      this.coll = ldb.db(Globals.mongoDatabaseName).collection(Globals.mongoCollectionName);
    });
  };

  static isList(item) {
    return (item.hasOwnProperty(Globals.listSchemaFieldName) || 
            !(item.hasOwnProperty(Globals.listIdFieldName)));
  };
  
  async simpleFind(listid, filter) {
    if (!(MongoDB.ObjectId.isValid(listid))) {
      throw new Errors.BadRequest(NodeUtil.format(Errors.ErrMsg.MalformedID, listid));
    }
    const idFilter = {[Globals.listIdFieldName]: MongoDB.ObjectId(listid)};
    const newFilter = {...idFilter, ...filter};
    const items = this.coll.findOne(newFilter);
    return items; 
  };

  async findWithItems(itemid, filter, noitems = false) {
    if (!(MongoDB.ObjectId.isValid(itemid))) {
      throw new Errors.BadRequest(NodeUtil.format(Errors.ErrMsg.MalformedID, itemid));
    }
    
    var item = await this.coll.findOne({[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)});

    if (!item) {
      throw new Errors.NotFound(NodeUtil.format(Errors.ErrMsg.ListItem_NotFound, itemid));
    }

    if (!noitems && ListItemControler.isList(item)) {
      var lookup = {from: Globals.mongoCollectionName, localField: Globals.itemIdFieldName, foreignField: Globals.listIdFieldName, as: 'items'};

      if (filter) {
        var mongoDBFilter = new ItemFilter(filter);
        var jsonFilter = mongoDBFilter.final();
        lookup.let = {x: '$' + Globals.itemIdFieldName};
        lookup.pipeline = [{$match: 
                            {$expr: 
                              {$and: [
                                {$eq: ['$' + Globals.listIdFieldName, '$$x']},
                                jsonFilter
                              ]}
                            }
                          }];
        delete lookup.localField;
        delete lookup.foreignField;
      }

      var pipeline = [{$match: {[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)}},
                      {$lookup: lookup},
                      {$unset: 'items.' + Globals.listIdFieldName}
                     ];
      item = await this.coll.aggregate(pipeline).toArray();
      item = item[0];
    }

    return item;
  };

  async getListSchema(listid) {
    if (listid) {
      const list = await this.coll.findOne({[Globals.itemIdFieldName]: MongoDB.ObjectId(listid)});
      if (!list) {
        throw new Errors.NotFound(NodeUtil.format(Errors.ErrMsg.List_NotFound, listid));
      }
      return list.listschema;
    }
    return listSchema;
  };
  /*
    Validate items against the schema stored in the item with _id = listid
    When strict is false, ignore fields which are not in the schema, otherwise throw an error
  */
  async validateItems(item, strict = true) {
    if (!(ListItemControler.isList(item)) && !(item[Globals.listIdFieldName])) {
      throw new Errors.BadRequest(NodeUtil.format(Errors.ErrMsg.ItemSchema_MissingField, Globals.listIdFieldName));
    }
    // find listitem schema
    const schemaStr = await this.getListSchema(item[Globals.listIdFieldName]);
    var newItems;
    // validate provided JSON against the schema
    try {
      const schema = new ItemSchema(schemaStr, item[Globals.listIdFieldName]);
      if (!(ListItemControler.isList(item))) {
        schema.schema[Globals.listIdFieldName] = {type: 'objectid', required: true};      
      }
      if (item.hasOwnProperty('items')) { // validate many
        newItems = await Promise.all(item.items.map(async (thisitem) => {
          // move the listid value to the item level
          if (strict && item[Globals.listIdFieldName]) {
            thisitem[Globals.listIdFieldName] = item[Globals.listIdFieldName];
          }
          var newItem = await schema.validateJson(thisitem, strict);
          return newItem;
        }))
      }
      else { // validate only one
        newItems = await schema.validateJson(item, strict);

      }
    } catch(err) {
      throw new Errors.BadRequest(err.message);
    }
    return newItems;
  };

  async insertMany(item) {
    var newitems = await this.validateItems(item);

    // create it
    if (newitems.length === undefined){
      await this.coll.insertOne(newitems);
    }
    else {   
      newitems = await this.coll.insertMany(newitems);
    }

    if (!newitems || (newitems.acknowledged !== undefined && !newitems.acknowledged)) {
      throw new Errors.InternalServerError(Errors.ErrMsg.ListItem_CouldNotCreate);
    }

    // delete the acknoledgment property if there was many items
    if (newitems.acknowledged !== undefined) {
      delete newitems.acknowledged;
    }

    return newitems;
  };

  async patch(itemid, newitem) {
    if (!(MongoDB.ObjectId.isValid(itemid))) {
      throw new Errors.BadRequest(NodeUtil.format(Errors.ErrMsg.MalformedID, itemid));
    }

    // find the item to get it's parent list schema
    var item = await this.coll.findOne({[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)});
    if (!item) {
      throw new Errors.NotFound(NodeUtil.format(Errors.ErrMsg.ListItem_NotFound, itemid));
    }

    if (item[Globals.listIdFieldName]) {
      newitem[Globals.listIdFieldName] = item[Globals.listIdFieldName];
    }

    newitem = await this.validateItems(newitem, false);
    // update it
    item = await this.coll.findOneAndUpdate({[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)}, {$set: newitem}, {returnDocument: 'after'});
    if (!(item.ok)) {
      throw new Errors.InternalServerError(Errors.ErrMsg.ListItem_CouldNotUpdate);
    }
    return item.value;
  };

  deleteAll() {
    return this.coll.deleteMany({});
  };
}

module.exports = new ListItemControler;

//console.log('asa');
