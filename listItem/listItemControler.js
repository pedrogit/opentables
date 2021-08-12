const MongoDB = require('mongodb');
const Errors = require('../utils/errors');
const Utils = require('../utils/utils');
const ItemSchema = require('../listItemSchema');

const mongoCollection = 'listitem';

class ListItemControler {

  constructor() {
    console.log('cons');
      MongoDB.MongoClient.connect('mongodb://localhost/', (err, ldb) => {
        if (err) {
        throw new Error('Could not connect to database...');
      }
      this.coll = ldb.db('listitdata').collection('listitem');
    });
  };

  isList(item) {
    return item.hasOwnProperty('listschema');
  }

  isListItem(item) {
    return item.hasOwnProperty('listid');
  }

  async findOne(itemid) {
    var item = await this.coll.findOne({_id: MongoDB.ObjectId(itemid)});

    if (!item) {
      throw new Errors.NotFound('Could not find list item (' + itemid + ')...');
    }

    if (this.isList(item)) {
      var pipeline = [{$match: {_id: MongoDB.ObjectId(itemid)}},
                      {$lookup: {from: mongoCollection, localField: '_id', foreignField: 'listid', as: 'items'}},
                      {$unset: 'items.listid'}
                     ];
      item = await this.coll.aggregate(pipeline).toArray();
      item = item[0];
    }

    return item;
  }

  async getListSchema(listid) {
    var schema = '{ownerid: {type: string, required}, \
                   rperm:  {type: string, required}, \
                   wperm:  {type: string, required}, \
                   listschema:  {type: string, required}}';
    if (listid) {
      const list = await this.coll.findOne({_id: MongoDB.ObjectId(listid)});
      if (!list) {
        throw new Errors.NotFound('Could not find list with id (' + listid + ')...');
      }
      schema = list.listschema;
    }
    return schema;
  }

  async insert(listitem) {
    if (!(this.isList(listitem) || this.isListItem(listitem))) {
      throw new Errors.BadRequest('Invalid item...');
    }

    const schemaStr = await this.getListSchema(this.isListItem(listitem) ? listitem.listid : undefined);

    try {
      const schema = new ItemSchema(schemaStr);
      listitem = schema.validateJson(listitem);
    } catch(err) {
      throw new Errors.BadRequest(err.message);
    }

    // convert the listid to an objectid
    if (this.isListItem(listitem)) {
      listitem.listid = MongoDB.ObjectId(listitem.listid);
    }
    await this.coll.insertOne(listitem);

    if (!listitem) {
     throw new Errors.NotFound('Could not create item...');
    }

    return listitem;
  }


  async patch(itemid, listitem) {
    if (!(MongoDB.ObjectId.isValid(itemid))) {
      throw new Errors.BadRequest('Invalid ID format...');
    }

    // first find the item to get it's parent list schema
    var item = await this.coll.findOne({_id: MongoDB.ObjectId(itemid)});
    if (!item) {
      throw new Errors.NotFound('Could not find list item (' + itemid + ')...');
    }
    const schemaStr = await this.getListSchema(this.isListItem(item) ? item.listid : 0);

    // validate the updated fields
    try {
      const schema = new ItemSchema(Utils.OTSchemaToJSON(schemaStr));
      listitem = schema.validateJson(listitem, false);
    } catch(err) {
      throw new Errors.BadRequest(err.message);
    }
    
    // update
    item = await this.coll.findOneAndUpdate({_id: MongoDB.ObjectId(itemid)}, {$set: listitem}, {returnDocument: 'after'});
    if (!(item.ok)) {
      throw new Error('Could not update item...');
    }
    return item.value;
  }

  deleteAll() {
    return this.coll.deleteMany({});
  }
}

module.exports = new ListItemControler;
