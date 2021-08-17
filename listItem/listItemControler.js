const MongoDB = require('mongodb');
const Errors = require('../utils/errors');
const Utils = require('../utils/utils');
const Globals = require('../globals');
const ItemSchema = require('../listItemSchema');
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

  async findOne(itemid, noitems = false) {
    if (!(MongoDB.ObjectId.isValid(itemid))) {
      throw new Errors.BadRequest(NodeUtil.format(Errors.ErrMsg.MalformedID, itemid));
    }
    
    var item = await this.coll.findOne({[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)});

    if (!item) {
      throw new Errors.NotFound(NodeUtil.format(Errors.ErrMsg.ListItem_NotFound, itemid));
    }

    if (!noitems && this.isList(item)) {
      var pipeline = [{$match: {[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)}},
                      {$lookup: {from: Globals.mongoCollectionName, localField: Globals.itemIdFieldName, foreignField: Globals.listIdFieldName, as: 'items'}},
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

  async validateItem(item, listid, strict = true) {
    // find listitem schema
    const schemaStr = await this.getListSchema(listid);

    // validate provided JSON against the schema
    try {
      const schema = new ItemSchema(schemaStr);
      item = schema.validateJson(item, strict);
    } catch(err) {
      throw new Errors.BadRequest(err.message);
    }
    return item;
  }

  async insert(item) {
    if (!(this.isList(item) || this.isListItem(item))) {
      throw new Errors.BadRequest(Errors.ErrMsg.ListItem_Invalid);
    }

    var item = await this.validateItem(item, this.isListItem(item) ? item[Globals.listIdFieldName] : undefined);
  
    // convert the listid to an objectid
    if (this.isListItem(item)) {
      item[Globals.listIdFieldName] = MongoDB.ObjectId(item[Globals.listIdFieldName]);
    }

    // create it
    await this.coll.insertOne(item);

    if (!item) {
      throw new Errors(Errors.ErrMsg.ListItem_CouldNotCreate);
    }

    return item;
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

    newitem = await this.validateItem(newitem, this.isListItem(item) ? item[Globals.listIdFieldName] : undefined, false);
    
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
