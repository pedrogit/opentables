const express = require('express');
const listRouter = express.Router();
const listModel = require('./listmodel');

const Errors = require('./errors');


listRouter.get('', function(req, res, next){
  listModel.find({})
           .then(function(lists){
                   res.send(lists);
                 }).catch(next);
});

listRouter.get('/:ownerid', function(req, res, next) {
  listModel.findById(req.params.ownerid)
           .then(function(list){
                   if (!list) {
                        next(new Errors.NotFound('No such list (' + res.req.params.ownerid + ')...'));
                   }
                   else {
                     res.send(list);
                   };
                 }).catch(next);
});

listRouter.post('', function(req, res, next){
  console.log(req.body);
  listModel.create(req.body)
           .then(function(list){
                   if (! (list instanceof Array))
                   {
                     list = JSON.parse('[' + JSON.stringify(list) + ']');
                   }
                     
                   res.status(201)
                      .send(list);
                 }).catch(next);
});

listRouter.delete('', function(req, res, next){
  listModel.deleteMany({})
           .then(function(lists){
                   // if DELETE fails return 500
                   if (lists.ok != 1)
                     next();

                   res.send({'deletedCount': lists.deletedCount});
                 }).catch(next);
});

module.exports = listRouter;

/*

View API
  Permission: read and edit
  Edit permission implies read permission (since edit permission automatically allow changing read permission)
  @viewowner = view owner
  @listowner keyword = list owner
  @all = everybody
  @itemowner = item owner (when items have a itemowner field)

  GET /api/view               // Get all views the users has permission to view
                              // Status: 200, 401, 403, 404 (no views weres found)
                              // Details: includes all views owned by the user
                              // What if the user does not have permission to view the linked list

  GET /api/view/:viewid       // Get a view by viewid if has view read permission 
                              // with all the linked list and its list items if has list read permission 
                              // Status: 200, 401, 403, 404 (no view was found)

  GET /api/view/:ownerid/ownedby        // Get all views owned by a specific user
                                       // Status: 200, 400 invalid userid, 401, 403(?), 404 (the requested userid was not found)

  GET /api/view/:userid/subscribedtoby  // Get all views a specific user has subscribed to
                                       // Status: 200, 400 invalid userid, 401, 403(?), 404 (the requested userid was not found)

  POST /api/view              // Post a new view with new list and list items or a default linked list
                              // Status: 201, 400 invalid json, 401, 403
 
  PATCH /api/view/:viewid     // Patch a view by id if has view edit permission 
                              // Status: 200, 400 invalid json or invalid viewid, 401, 403
  
  DELETE /api/view/:viewid    // Delete a view by id and the linked list if no more view links to it and has list edit permission
                              // Status: 200, 400 invalid or invalid viewid, 401, 403

List API

  GET /api/list/:listid       // Get a list and the linked listitems by listid if has list read permission
                              // Status: 200, 400 invalid listid, 401, 403, 404 (the requested listid was not found)
                              // Params
                              //   noitems: When included do not include listdata. Default false.
  
  POST /api/list              // Post a new list with or without data
                              // Status: 201, 400 invalid json, 401, 403
  
  PATCH /api/list/:listid     // Patch a list by id
                              // Status: 200, 400 invalid json or invalid listid, 401, 403
    
  DELETE /api/list/:listid    // Delete a list by id
                              // Status: 200, 400 invalid or invalid listid, 401, 403

Listitem API

  GET /api/listitem/:listid/:itemid     // Get a list item by id if has list read permission
                                        // Status: 200, 400 invalid or invalid listid, 401, 403

  POST /api/listitem/:listid/           // Post one or many new list items if has list edit permission
                                        // Status: 201, 400 invalid json, 401, 403

  PATCH /api/listitem/:listid/:itemid   // Patch a list item if has list edit permission
                                        // Status: 200, 400 invalid json, 401, 403
                                        // Param
                                        //   field and value
  
  DELETE /api/listitem/:listid          // Delete all items from a list if has list edit permission
                                        // Status: 200, 400 invalid json, 401, 403

  DELETE /api/listitem/:listid/:itemid  // Delete one or many list items if has list edit permission
                                        // Status: 200, 400 invalid json, 401, 403

  Response status codes

  - 200 OK
  - 201 Created - posted resource have been created
  - 400 Bad Request – client sent an invalid request, such as lacking required request body or parameter
  - 401 Unauthorized – client failed to authenticate with the server
  - 403 Forbidden – client authenticated but does not have permission to access the requested resource
  - 404 Not Found – the requested resource does not exist
  - 412 Precondition Failed – one or more conditions in the request  fields evaluated to false
  - 422 Unprocessable Entity - Well formed but unprocessable request (not used)
  - 500 Internal Server Error – a generic error occurred on the server
  - 503 Service Unavailable – the requested service is not available

*/

/* Different ways to handle errors:

// Errors are of different types:

1) Invalid id for GET :id or DELETE :id
2) Missing Restfull data in POST or PATCH
2) Invalid json data

// Method A) Using an app global handler (from https://towardsdatascience.com/build-a-rest-api-with-node-express-and-mongodb-937ff95f23a5)

// in the router
Student.find({}).then(function(students){
    res.send(students);
}).catch(next);

// in the application
app.use(function(err, req, res, next){
    res.status(422).send({error: err.message});
 });


// Method B) Invoquing the default Express error handler (from MERN Quick Start Guide)

app.get('/', (request, response, next) => {
  try {
    throw new Error('Oh no!, something went wrong!')
  } catch (error) {
    next(error)
  }
})

// or a custom one
app.use((error, request, response, next) => {
  response.end(error.message)
})

// Method C) 

 */


