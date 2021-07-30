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
               .then(item => {              
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
           .then(list => {
              list.validateItem(req.body.item);
              listItemModel.create(req.body)
                           .then(item => {
                                  if (!item) {
                                    next(new Errors.NotFound('Could not create item...'));
                                  }
                                  else {
                                    list.updateOne({$push: {"items": item.id}})
                                        .then(list => {
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
               .then(item => {  
                       listModel.findById(item.listid.toString())
                                .then(list => {
                                        list.validateItem(req.body);
                                        const toSet = Utils.prefixAllKeys(req.body, 'item.');
                                        listItemModel.findByIdAndUpdate(req.params.itemid, {$set: toSet}, {new: true})
                                            .then(newitem => {              
                                                    res.status(200).send(newitem);
                                             }).catch(next);
                                 }).catch(next);
               }).catch(next);
});

/************************************************************************
  DELETE /api/listitem/:itemid  // Delete one or many list items if has list edit permission
                                // Status: 200, 400 invalid json, 401, 403

*************************************************************************/
    
module.exports = listItemRouter;
