const express = require('express');
const listRouter = express.Router();
const listControler = require('./listControler');

const Errors = require('../utils/errors');
const asyncHandler = require('express-async-handler')

/************************************************************************
  GET /api/list/:listid

  Get a list and the linked listitems by listid if has list read permission.

  Return status: 200, 400 invalid listid, 401, 403, 404 (the requested listid was not found)

  Options:
    noitems: Do not includes items. Default false.

*************************************************************************/
listRouter.get('/:listid', asyncHandler(async (req, res, next) => {
  const list = await listControler.findById(req.params.listid);
  res.status(200).send(list);
}));

/************************************************************************
  POST /api/list
  
  Post a new list with or without data.
  
  Return status: 201, 400 invalid json, 401, 403
  
*************************************************************************/
listRouter.post('', asyncHandler(async (req, res, next) => {
  const list = await listControler.create(req.body)
  res.status(201).send(list);
}));

/************************************************************************
  PATCH /api/list/:listid
  
  Patch a list by id.
  
  Return status: 200, 400 invalid json or invalid listid, 401, 403

*************************************************************************/
listRouter.patch('/:listid', asyncHandler(async (req, res, next) => {
  const list = await listControler.patch(req.params.listid, req.body)
  res.status(200).send(list);
}));

/************************************************************************
 DELETE /api/list/:listid
 
 Delete a list by id and all its items
 
 Return status: 200, 400 invalid or invalid listid, 401, 403

*************************************************************************/

/************************************************************************
 DELETE /api/list/
 
 Delete all lists!vFor testing purpose only
 
 Return status: 200, 400 invalid or invalid listid, 401, 403

*************************************************************************/
listRouter.delete('', asyncHandler(async (req, res, next) => {
  const result = await listControler.deleteAll(res, next)  
  // if DELETE fails let the server default error handler return 500
  if (result.ok != 1) {
    next();
  }
  // otherwise send the count of object deleted
  res.status(200).send({'deletedCount': result.deletedCount});
}));

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
 
  POST /api/view/viewid       // Clone a view and set the user a new owner
                              // Status: 201, 400 invalid json, 401, 403
                              // Options
                              //   copyMode=emptyList|fullList|refToList

  PATCH /api/view/:viewid     // Patch a view by id if has view edit permission 
                              // Status: 200, 400 invalid json or invalid viewid, 401, 403
  
  DELETE /api/view/:viewid    // Delete a view by id and the linked list if no more view links to it and has list edit permission
                              // Status: 200, 400 invalid or invalid viewid, 401, 403
 

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


