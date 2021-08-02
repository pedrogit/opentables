const listModel = require('./listmodel');

const Errors = require('./errors');

class ListControler {
  findById(listid, res, next){
    listModel.findById(listid)
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
      list.items.forEach(function(v){ v.listid = undefined;});
      res.status(200).send(list);
    }).catch(next);
  }

  create(body, res, next) {
    listModel.validate(body)
    .create(body)
    .then(list => {
      if (!list) {
        throw new Errors.NotFound('Could not create new list...');
      }
      else {
        res.status(201).send(list);
      };
    }).catch(next);
  }

  patch(listid, body, res, next) {
    listModel.validate(body)
    .findByIdAndUpdate(listid, body, {new: true})
    .then(list => {              
      res.status(200).send(list);
    }).catch(next);
  }

  deleteAll(res, next) {
    listModel.deleteMany({})
    .then(lists => {
      // if DELETE fails return 500
      if (lists.ok != 1) {
        next();
      }
      // otherwise send the count of object deleted
      res.status(200).send({'deletedCount': lists.deletedCount});
    }).catch(next);
  }
}

module.exports = new ListControler;