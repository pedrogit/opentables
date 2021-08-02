const listItemModel = require('./listitemmodel');
const listModel = require('../list/listmodel');

const Errors = require('../utils/errors');
const Utils = require('../utils/utils');

class ListItemControler {
  findById(itemid, res, next){
    listItemModel.findById(itemid)
    .then(item => {              
      res.status(200).send(item);
    }).catch(next);
  }

  create(listitem, res, next){
    if (!(listitem.hasOwnProperty('listid'))){
        throw new Errors.BadRequest('Listid missing for new item...');
    }
    // make sure the list exists
    var list = listModel.findById(listitem.listid);
    list.then(list => {
        list.validateItem(listitem.item);
        return list;
    })
    .then(list => {
        return listItemModel.create(listitem);
    })
    .then(item => {
        if (!item) {
          throw new Errors.NotFound('Could not create item...');
        }
        list.updateOne({$push: {"items": item.id}});
        return item;
    })
    .then(item => {
        res.status(201).send(item);
    })
    .catch(next);
  }

  patch(itemid, listitem, res, next){
    listItemModel.findById(itemid)
    .then(item => {  
        return listModel.findById(item.listid.toString())
    })
    .then(list => {
        list.validateItem(listitem);
        const toSet = Utils.prefixAllKeys(listitem, 'item.');
        return listItemModel.findByIdAndUpdate(itemid, {$set: toSet}, {new: true});
    })
    .then(newitem => {              
        res.status(200).send(newitem);
    }).catch(next);
  }
}

module.exports = new ListItemControler;
