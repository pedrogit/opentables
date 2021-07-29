const mongoose = require('mongoose');
const express = require('express');
const listItemRouter = express.Router();
const listItemModel = require('./listitemmodel');
const listModel = require('./listmodel');

const Errors = require('./errors');

// ListItem as a referenced document implementation

listItemRouter.get('/:itemid', function(req, res, next) {
  listItemModel.findById(req.params.itemid)
           .then(function(item){              
              res.status(200).send(item);
          }).catch(next);
});

listItemRouter.post('', function(req, res, next){
  console.log(req.body);
  listItemModel.create(req.body)
               .then(function(item){
                   if (!item) {
                     next(new Errors.NotFound('Could not create item...'));
                   }
                   else {
                     // push the item in the list
                     listModel.findByIdAndUpdate(item.listid, 
                                                 {$push: {"items": item.id}},
                                                 {new: true})
                              .then(function(list){
                                 res.status(201).send(item);
                               })
                   };
       }).catch(next);
});

listItemRouter.patch('/:itemid', function(req, res, next) {
  listItemModel.findByIdAndUpdate(req.params.itemid, 
                                   //{$set: {"item.field2": "field2 new value"}}, 
                                   {$set: req.body}, 
                                   {new: true})
           .then(function(item){              
              res.status(200).send(item);
          }).catch(next);
});


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
