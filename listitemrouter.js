const mongoose = require('mongoose');
const express = require('express');
const listItemRouter = express.Router();
const listItemModel = require('./listitemmodel');
const listModel = require('./listmodel');

const Errors = require('./errors');
const Utils = require('./utils');


// ListItem as a referenced document implementation

/************************************************************************
  GET /api/listitem/:itemid

  Get a list item by id if has list read permission.

  Return status: 200, 400 invalid or invalid listid, 401, 403

*************************************************************************/
listItemRouter.get('/:itemid', function(req, res, next) {
  listItemModel.findById(req.params.itemid)
               .then(function(item){              
                       res.status(200).send(item);
               }).catch(next);
});

/************************************************************************
  POST /api/listitem/

  Post one or many new list items if has list edit permission.

  Return status: 201, 400 invalid json, 401, 403

*************************************************************************/
listItemRouter.post('', function(req, res, next){
  console.log(req.body);
  if (!(req.body.hasOwnProperty('listid'))){
    throw new Errors.BadRequest('Listid missing for new item...');
  }
  // make sure the list exists
  listModel.findById(req.body.listid)
           .then(function(list){
              list.validateItem(req.body.item);
              listItemModel.create(req.body)
                           .then(function(item){
                                  if (!item) {
                                    next(new Errors.NotFound('Could not create item...'));
                                  }
                                  else {
                                    list.updateOne({$push: {"items": item.id}})
                                        .then(function(list){
                                                res.status(201).send(item);
                                        }).catch(next);
                                  }
                            }).catch(next);
          }).catch(next);
        });

/************************************************************************
  POST /api/listitem/:itemid
  
  Clone an item if has list edit permission.

  Return status: 201, 400 invalid json, 401, 403
*************************************************************************/

/************************************************************************
  PATCH /api/listitem/:itemid
  
  Patch a list item if has list edit permission.

  Return status: 200, 400 invalid json, 401, 403

*************************************************************************/
listItemRouter.patch('/:itemid', function(req, res, next) {
  listItemModel.findById(req.params.itemid)
               .then(function(item){  
                       listModel.findById(item.listid.toString())
                                .then(function(list){
                                        list.validateItem(req.body);
                                        const toSet = Utils.prefixAllKeys(req.body, 'item.');
                                        listItemModel.findByIdAndUpdate(req.params.itemid, {$set: toSet}, {new: true})
                                            .then(function(newitem){              
                                                    res.status(200).send(newitem);
                                             }).catch(next);
                                 }).catch(next);
               }).catch(next);
});

/************************************************************************
  DELETE /api/listitem/:itemid  // Delete one or many list items if has list edit permission
                                // Status: 200, 400 invalid json, 401, 403

*************************************************************************/

/* ListItem as a subdocument implementation

listItemRouter.post('/:listid', function(req, res, next) {
    listItemModel.findById(req.params.listid)
           .then(function(list){
                   if (!list) {
                        next(new Errors.NotFound('No such list (' + res.req.params.listid + ')...'));
                   }
                   else {
                     res.req.body._id = mongoose.Types.ObjectId().toString();

                     list.data.push(res.req.body);
                     //list.save() // not atomic
                     listModel.findByIdAndUpdate(res.req.params.listid, list, {new: true}) // atomic
                         .then(function(list){              
                                 res.status(201)
                                    .send(list.data.find(id => id = res.req.body._id));
                     }).catch(next);
                   };
                 }).catch(next);
  });
  
  listItemRouter.patch('/:listid/:itemid', function(req, res, next) {
    listModel.findOneAndUpdate({_id: req.params.listid, "data._id": req.params.itemid},
                               {$set: {"data.$.field2": "field2 new value"}}, {new: true})
             .then(function(list){
                     if (list.n == 0) {
                          next(new Errors.NotFound('No such list (' + res.req.params.listid + ')...'));
                     }
                     else {
                       res.status(200)
                          .send(list.data.find(id => id = res.req.params.itemid));
                     };
                   }).catch(next);
  });
  */
    
module.exports = listItemRouter;
