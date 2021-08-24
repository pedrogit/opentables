const MongoDB = require('mongodb');
const Errors = require('../utils/errors');
const Utils = require('../utils/utils');
const Globals = require('../globals');
const ItemSchema = require('../listItemSchema');
const ItemFilter = require('../listItemFilter');

const NodeUtil = require('util');

const listSchema = '{' + Globals.ownerIdFieldName + ': {type: string, required}, \
                     rperm:  {type: string, required}, \
                     wperm:  {type: string, required}, \
                     ' + Globals.listSchemaFieldName + ':  schema}';

class ListItemControler {

  constructor() {
    MongoDB.MongoClient.connect(Globals.serverAddress, (err, ldb) => {
      if (err) {
        throw new Error(Errors.ErrMsg.Database_CouldNotConnect);
      }
      this.coll = ldb.db(Globals.mongoDatabaseName).collection(Globals.mongoCollectionName);
    });
  };

  isList(item) {
    return item.hasOwnProperty(Globals.listSchemaFieldName);
  }

  isListItem(item) {
    return item.hasOwnProperty(Globals.listIdFieldName);
  }

  async find(itemid, filter, noitems = false) {
    if (!(MongoDB.ObjectId.isValid(itemid))) {
      throw new Errors.BadRequest(NodeUtil.format(Errors.ErrMsg.MalformedID, itemid));
    }
    
    var item = await this.coll.findOne({[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)});

    if (!item) {
      throw new Errors.NotFound(NodeUtil.format(Errors.ErrMsg.ListItem_NotFound, itemid));
    }

    if (!noitems && this.isList(item)) {
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
  }

  async getListSchema(listid) {
    if (listid) {
      const list = await this.coll.findOne({[Globals.itemIdFieldName]: MongoDB.ObjectId(listid)});
      if (!list) {
        throw new Errors.NotFound(NodeUtil.format(Errors.ErrMsg.List_NotFound, listid));
      }
      return list.listschema;
    }
    return listSchema;
  }
  /*
    Validate items against the schema stored in the item with _id = listid
    When strict is false, ignore fields which are not in the schema, otherwise throw an error
  */
  async validateItems(item, listid, strict = true) {
    // find listitem schema
    const schemaStr = await this.getListSchema(listid);
    var newItems;
    // validate provided JSON against the schema
    try {
      const schema = new ItemSchema(schemaStr, listid);
      if (item.hasOwnProperty('items')) { // validate many
        newItems = item.items.map(item => {
          var newItem = schema.validateJson(item, strict);
          if (strict && listid && (!newItem[Globals.listIdFieldName] || typeof newItem[Globals.listIdFieldName] === 'string')) {
            newItem[Globals.listIdFieldName] = MongoDB.ObjectId(listid);
          }

          return newItem;
        })
      }
      else { // validate only one
        newItems = schema.validateJson(item, strict);
        if (strict && listid && (!newItems[Globals.listIdFieldName] || typeof newItems[Globals.listIdFieldName] === 'string')) {
          newItems[Globals.listIdFieldName] = MongoDB.ObjectId(listid);
        }
      }
    } catch(err) {
      throw new Errors.BadRequest(err.message);
    }
    return newItems;
  }

  async insertMany(item) {
    var newitems = await this.validateItems(item, this.isListItem(item) ? item[Globals.listIdFieldName] : undefined);

    // create it
    if (newitems.length === undefined){
      await this.coll.insertOne(newitems);
    }
    else {   
      newitems = await this.coll.insertMany(newitems);
    }

    if (!newitems || (newitems.acknowledged !== undefined && !newitems.acknowledged)) {
      throw new Errors(Errors.ErrMsg.ListItem_CouldNotCreate);
    }

    // delete the acknoledgment property if there was many items
    if (newitems.acknowledged !== undefined) {
      delete newitems.acknowledged;
    }

    return newitems;
  }

  async patch(itemid, newitem) {
    if (!(MongoDB.ObjectId.isValid(itemid))) {
      throw new Errors.BadRequest(NodeUtil.format(Errors.ErrMsg.MalformedID, itemid));
    }

    // find the item to get it's parent list schema
    var item = await this.coll.findOne({[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)});
    if (!item) {
      throw new Errors.NotFound(NodeUtil.format(Errors.ErrMsg.ListItem_NotFound, itemid));
    }

    newitem = await this.validateItems(newitem, this.isListItem(item) ? item[Globals.listIdFieldName] : undefined, false);
    // update it
    item = await this.coll.findOneAndUpdate({[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)}, {$set: newitem}, {returnDocument: 'after'});
    if (!(item.ok)) {
      throw new Error(Errors.ErrMsg.ListItem_CouldNotUpdate);
    }
    return item.value;
  }

  deleteAll() {
    return this.coll.deleteMany({});
  }
}

module.exports = new ListItemControler;
