const MongoDB = require('mongodb');
const Errors = require('./utils/errors');
const Utils = require('./utils/utils');
const Globals = require('./globals');
const ItemSchema = require('./listItemSchema');
const ItemFilter = require('./listItemFilter');

const NodeUtil = require('util');

const listSchema = '{' + Globals.itemIdFieldName + ': objectid, '
                       + Globals.ownerFieldName + ': {type: user, required},  '
                       + Globals.listConfPermFieldName + ':  {type: user_array, required, lower},  '
                       + Globals.listWritePermFieldName + ':  {type: user_array, required, lower}, '
                       + Globals.listReadPermFieldName + ':  {type: user_array, required, lower}, '
                       + Globals.listSchemaFieldName + ':  {type: schema, lower}}';

class ListItemControler {
  constructor() {
    MongoDB.MongoClient.connect(process.env.MONGODB_ADDRESS, (err, ldb) => {
      if (err) {
        throw new Errors.InternalServerError(Errors.ErrMsg.Database_CouldNotConnect);
      };
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
    };
    const idFilter = {[Globals.listIdFieldName]: MongoDB.ObjectId(listid)};
    const newFilter = {...idFilter, ...filter};
    const items = this.coll.findOne(newFilter);
    return items; 
  };

  static validatePerm(user, listOwner, listCPerm, listWPerm, listRPerm) {
    // admin and listowner have all permissions
    if (user === process.env.ADMIN_EMAIL || user === listOwner) {
      return;
    }

    if (user !== Globals.unauthUserName) {
      // if listCPerm permission is @all or the user is listed, grant permission
      if (listCPerm && (listCPerm === '@all' || listCPerm.split(/\s*,\s*/).includes(user))) {
        return;
      }

      // if listWPerm permission is @all or the user is listed, grant permission
      if (listWPerm && (listWPerm === '@all' || listWPerm.split(/\s*,\s*/).includes(user))) {
        return;
      }
    }

    // if listRPerm permission is @all or the user is listed, grant permission
    if (listRPerm && (listRPerm === '@all' || listRPerm.split(/\s*,\s*/).includes(user))) {
      return;
    }

    throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
  }

  async getParentList(item) {
    // it's a list!
    if (ListItemControler.isList(item)) {
      var result = {[Globals.listSchemaFieldName]: listSchema}
      return result;
    }
    
    // it's a list item
    if (!(item[Globals.listIdFieldName])) {
      throw new Errors.BadRequest(NodeUtil.format(Errors.ErrMsg.ItemSchema_MissingField, Globals.listIdFieldName));
    }
    const list = await this.coll.findOne({[Globals.itemIdFieldName]: MongoDB.ObjectId(item[Globals.listIdFieldName])});
    if (!list) {
      throw new Errors.NotFound(NodeUtil.format(Errors.ErrMsg.List_NotFound, item[Globals.listIdFieldName]));
    }
    return list;
  };

  async findWithItems(user, itemid, filter, noitems = false) {
    if (!(MongoDB.ObjectId.isValid(itemid))) {
      throw new Errors.BadRequest(NodeUtil.format(Errors.ErrMsg.MalformedID, itemid));
    };
    
    var item = await this.coll.findOne({[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)});

    if (!item) {
      throw new Errors.NotFound(NodeUtil.format(Errors.ErrMsg.ListItem_NotFound, itemid));
    };

    if (ListItemControler.isList(item)) {

      // validate permissions
      ListItemControler.validatePerm(user, item[Globals.ownerFieldName], item[Globals.listConfPermFieldName], item[Globals.listWritePermFieldName], item[Globals.listReadPermFieldName]);

      if (!noitems) {
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
        };

        var pipeline = [{$match: {[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)}},
                        {$lookup: lookup},
                        {$unset: 'items.' + Globals.listIdFieldName}
                      ];
        item = await this.coll.aggregate(pipeline).toArray();
        item = item[0];
      }
    }
    else {
      // find listitem schema
      var parentList = await this.getParentList(item);
      // validate permissions
      ListItemControler.validatePerm(user, parentList[Globals.ownerFieldName], parentList[Globals.listConfPermFieldName], parentList[Globals.listWritePermFieldName], parentList[Globals.listReadPermFieldName]);
    }

    return item;
  };

  /*
    Validate items against the schema stored in the item with _id = listid
    When strict is false, ignore fields which are not in the schema, otherwise throw an error
  */
  async validateItems(schemaStr, item, strict = true) {
    var newItems;
    // validate provided JSON against the schema
    try {
      const schema = new ItemSchema(schemaStr, this, item[Globals.listIdFieldName]);

      // add the schema description for the listid property
      if (!(ListItemControler.isList(item))) {
        schema.schema[Globals.listIdFieldName] = {type: 'objectid', required: true};      
      }

      // validate many or one
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

  async insertMany(user, item) {
    // unauth user have no edit permissions
    if (user === Globals.unauthUserName) {
      throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
    }
    
    // find listitem schema
    var parentList = await this.getParentList(item);

    // validate permissions only for list items
    if (!(ListItemControler.isList(item))) {
      ListItemControler.validatePerm(user, parentList[Globals.ownerFieldName], parentList[Globals.listConfPermFieldName], parentList[Globals.listWritePermFieldName]);
    }
    
    // validate item against schema
    var newitems = await this.validateItems(parentList[Globals.listSchemaFieldName], item);

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

    // delete the acknowledgment property if there was many items
    if (newitems.acknowledged !== undefined) {
      delete newitems.acknowledged;
    }

    return newitems;
  };

  async patch(user, itemid, newitem) {
    // unauth user have no edit permissions
    if (user === Globals.unauthUserName) {
      throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
    }

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

    // find listitem schema
    var parentList = await this.getParentList(newitem);

    // validate permissions
    if (ListItemControler.isList(item)) {
      ListItemControler.validatePerm(user, item[Globals.ownerFieldName], item[Globals.listConfPermFieldName]);
    }
    else {
      ListItemControler.validatePerm(user, parentList[Globals.ownerFieldName], parentList[Globals.listConfPermFieldName], parentList[Globals.listWritePermFieldName]);
    }

    // validate item against schema
    newitem = await this.validateItems(parentList[Globals.listSchemaFieldName], newitem, false);
    
    // update it
    item = await this.coll.findOneAndUpdate({[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)}, {$set: newitem}, {returnDocument: 'after'});
    if (!(item.ok)) {
      throw new Errors.InternalServerError(Errors.ErrMsg.ListItem_CouldNotUpdate);
    }
    return item.value;
  };

  deleteAll(user) {
    if (user !== process.env.ADMIN_EMAIL) {
      throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
    }
    return this.coll.deleteMany({});
  };

  async delete(user, itemid) {
    // unauth user have no edit permissions
    if (user === Globals.unauthUserName) {
      throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
    }

    if (!(MongoDB.ObjectId.isValid(itemid))) {
      throw new Errors.BadRequest(NodeUtil.format(Errors.ErrMsg.MalformedID, itemid));
    }

    // find the item to check if it is a list or a listitem
    var item = await this.coll.findOne({[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)});
    if (!item) {
      throw new Errors.NotFound(NodeUtil.format(Errors.ErrMsg.ListItem_NotFound, itemid));
    }

    // find listitem schema
    var parentList = await this.getParentList(item);

    // check user permissions
    if (ListItemControler.isList(item)) {
      if (user !== process.env.ADMIN_EMAIL && user !== item.owner) {
        throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
      }
    }
    else {
      ListItemControler.validatePerm(user, parentList[Globals.ownerFieldName], parentList[Globals.listConfPermFieldName], parentList[Globals.listWritePermFieldName]);
    }
 
    if (ListItemControler.isList(item)) {
      // delete all associated listitem
      this.coll.deleteMany({[Globals.listIdFieldName]: MongoDB.ObjectId(item[Globals.listIdFieldName])});
    }
    return this.coll.deleteOne({[Globals.listIdFieldName]: itemid});
  };
}

module.exports = new ListItemControler;
