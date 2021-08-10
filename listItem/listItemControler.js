const listItemModel = require('./listItemModel');

const Errors = require('../utils/errors');
const Utils = require('../utils/utils');
const ItemSchema = require('../listItemSchema');

class ListItemControler {
  async findById(itemid) {
    const item = await listItemModel.findById(itemid);
    if (!item) {
      throw new Errors.NotFound('Could not find list item (' + itemid + ')...');
    }

    // populate the list items if it is a list
    if (item._doc.hasOwnProperty('listschema')) {
      await listItemModel.populate(item, {path: 'items'});
    }

    return item;
  }

  async getListSchema(listid) {
    var schema = '{ownerid: {type: string}, \
                   rperm:  {type: string}, \
                   wperm:  {type: string}, \
                   listschema:  {type: string}}';
    if (listid != 0) {
      const list = await listItemModel.findById(listid);
      schema = list._doc.listschema;
    }
    return schema;
  }

  async create(listitem) {
    const isList = listitem.hasOwnProperty('listschema');
    const isListItem = listitem.hasOwnProperty('listid')

    if (!(isList || isListItem)) {
      throw new Errors.BadRequest('Invalid item...');
    }

    const schemaStr = await this.getListSchema(listitem.listid ? listitem.listid : 0);

    try {
      const schema = new ItemSchema(schemaStr);
      listitem = schema.validateJson(listitem);
    } catch(err) {
      throw new Errors.BadRequest(err.message);
    }

    const item = await listItemModel.create(listitem);

    if (!item) {
     throw new Errors.NotFound('Could not create item...');
    }

    return item;
  }

  async patch(itemid, listitem) {
    const item = await listItemModel.findById(itemid);

    const isList = item.hasOwnProperty('listschema');
    const isListItem = item.hasOwnProperty('listid')

    const schemaStr = await this.getListSchema(item.listid ? item.listid : 0);

    try {
      const schema = new ItemSchema(Utils.OTSchemaToJSON(schemaStr));
      listitem = schema.validateJson(listitem);
    } catch(err) {
      throw new Errors.BadRequest(err.message);
    }

    //const toSet = Utils.prefixAllKeys(listitem, 'item.');
    return listItemModel.findByIdAndUpdate(itemid, {$set: listitem}, {new: true});
  }

  deleteAll() {
    return listItemModel.deleteMany({});
  }
}

module.exports = new ListItemControler;
