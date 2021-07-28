const mongoose = require('mongoose');
const express = require('express');
const listItemRouter = express.Router();
const listModel = require('./listmodel');

const Errors = require('./errors');

listItemRouter.post('/:listid', function(req, res, next) {
  listModel.findById(req.params.listid)
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
    
module.exports = listItemRouter;
