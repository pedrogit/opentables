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
    MongoDB.MongoClient.connect('mongodb://localhost/', (err, ldb) => {
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
    
    var item = await this.coll.findOne({_id: MongoDB.ObjectId(itemid)});

    if (!item) {
      throw new Errors.NotFound(NodeUtil.format(Errors.ErrMsg.ListItem_NotFound, itemid));
    }

    if (!noitems && this.isList(item)) {
      var pipeline = [{$match: {_id: MongoDB.ObjectId(itemid)}},
                      {$lookup: {from: Globals.mongoCollectionName, localField: '_id', foreignField: Globals.listIdFieldName, as: 'items'}},
                      {$unset: 'items.' + Globals.listIdFieldName}
                     ];
      item = await this.coll.aggregate(pipeline).toArray();
      item = item[0];
    }

    return item;
  }

  async getListSchema(listid) {
    if (listid) {
      const list = await this.coll.findOne({_id: MongoDB.ObjectId(listid)});
      if (!list) {
        throw new Errors.NotFound(NodeUtil.format(Errors.ErrMsg.List_NotFound, listid));
      }
      return list.listschema;
    }
    return listSchema;
  }

  async insert(listitem) {
    if (!(this.isList(listitem) || this.isListItem(listitem))) {
      throw new Errors.BadRequest(Errors.ErrMsg.ListItem_Invalid);
    }

    const schemaStr = await this.getListSchema(this.isListItem(listitem) ? listitem[Globals.listIdFieldName] : undefined);

    try {
      const schema = new ItemSchema(schemaStr);
      listitem = schema.validateJson(listitem);


    } catch(err) {
      throw new Errors.BadRequest(err.message);
    }

    // convert the listid to an objectid
    if (this.isListItem(listitem)) {
      listitem[Globals.listIdFieldName] = MongoDB.ObjectId(listitem[Globals.listIdFieldName]);
    }
    await this.coll.insertOne(listitem);

    if (!listitem) {
      throw new Errors(Errors.ErrMsg.ListItem_CouldNotCreate);
    }

    return listitem;
  }


  async patch(itemid, listitem) {
    if (!(MongoDB.ObjectId.isValid(itemid))) {
      throw new Errors.BadRequest(NodeUtil.format(Errors.ErrMsg.MalformedID, itemid));
    }

    // first find the item to get it's parent list schema
    var item = await this.coll.findOne({_id: MongoDB.ObjectId(itemid)});
    if (!item) {
      throw new Errors.NotFound(NodeUtil.format(Errors.ErrMsg.ListItem_NotFound, itemid));
    }
    const schemaStr = await this.getListSchema(this.isListItem(item) ? item[Globals.listIdFieldName] : 0);

    // validate the updated fields
    try {
      const schema = new ItemSchema(schemaStr);
      listitem = schema.validateJson(listitem, false);
    } catch(err) {
      throw new Errors.BadRequest(err.message);
    }
    
    // update
    item = await this.coll.findOneAndUpdate({_id: MongoDB.ObjectId(itemid)}, {$set: listitem}, {returnDocument: 'after'});
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
