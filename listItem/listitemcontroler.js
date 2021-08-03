const listItemModel = require('./listitemmodel');
const listModel = require('../list/listmodel');

const Errors = require('../utils/errors');
const Utils = require('../utils/utils');

class ListItemControler {
  async findById(itemid, res, next) {
    const item = await listItemModel.findById(itemid);
    if (!item) {
      throw new Errors.NotFound('Could not find list item (' + itemid + ')...');
    }
    return item;
  }

  async create(listitem, res, next) {
    if (!(listitem.hasOwnProperty('listid'))){
      throw new Errors.BadRequest('Listid missing for new item...');
    }
    // find the list in order to validate the item schema
    const list = await listModel.findById(listitem.listid);

    list.validateItem(listitem.item);

    const item = await listItemModel.create(listitem);

    if (!item) {
     throw new Errors.NotFound('Could not create item...');
    }
    await list.updateOne({$push: {"items": item.id}});

    return item;
  }

  async patch(itemid, listitem, res, next) {
    const item = await listItemModel.findById(itemid);
    const list = await listModel.findById(item.listid.toString());

    list.validateItem(listitem);
    const toSet = Utils.prefixAllKeys(listitem, 'item.');
    return listItemModel.findByIdAndUpdate(itemid, {$set: toSet}, {new: true});
  }
}

module.exports = new ListItemControler;
