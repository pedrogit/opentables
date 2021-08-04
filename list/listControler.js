const listModel = require('./listModel');

const Errors = require('../utils/errors');

class ListControler {
  async findById(listid) {
    const list = await listModel.findById(listid);

    if (!list) {
      throw new Errors.NotFound('Could not find list (' + listid + ')...');
    }
    await listModel.populate(list, {path: 'items'});

    // unset repeated fields
    return list.items.forEach(function(v){ v.listid = undefined;});
  }

  async create(list) {
    listModel.validate(list);
    const newlist = await listModel.create(list);

    if (!newlist) {
     throw new Errors.NotFound('Could not create new list...');
    }
    return newlist;
  }

  async patch(listid, list) {
    listModel.validate(list);
    
    const newlist = await listModel.findByIdAndUpdate(listid, list, {new: true});

    if (!newlist) {
     throw new Errors.NotFound('Could not create new list...');
    }
    return newlist;
  }

  deleteAll(res, next) {
    return listModel.deleteMany({});
  }
}

module.exports = new ListControler;