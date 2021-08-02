const listModel = require('./listmodel');

const Errors = require('../utils/errors');

class ListControler {
  findById(listid) {
    return listModel.findById(listid)
    .then(list => {
      if (!list) {
        throw new Errors.NotFound('No such list (' + listid + ')...');
      }
      else {
        return listModel.populate(list, {path: 'items'});
      }
    })
    .then(list => {
      // unset repeated fields
      return list.items.forEach(function(v){ v.listid = undefined;});
    });
  }

  create(list) {
    return listModel.validate(list)
    .create(list)
    .then(list => {
      if (!list) {
        throw new Errors.NotFound('Could not create new list...');
      }
      return list;
    });
  }

  patch(listid, list) {
    return listModel.validate(list).findByIdAndUpdate(listid, list, {new: true})
    .then(list => {
      if (!list) {
        throw new Errors.NotFound('Could not create new list...');
      }
      return list;
    });
  }

  deleteAll(res, next) {
    return listModel.deleteMany({});
  }
}

module.exports = new ListControler;