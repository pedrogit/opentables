const express = require('express');
const listItemRouter = express.Router();
const listItemControler = require('./listItemControler');

const asyncHandler = require('express-async-handler');
const url = require('url');

/************************************************************************
  GET /api/listitem/:itemid

  Get a list item by id if has list read permission.

  Options:
    noitems: Do not includes items. Default false.

  Return status: 200, 400 invalid or invalid listid, 401, 403

*************************************************************************/
listItemRouter.get('/:itemid/:noitems?', asyncHandler(async (req, res) => {
  const fullURL = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
  const item = await listItemControler.find(req.params.itemid, fullURL.searchParams.get('filter'), req.params.noitems === 'noitems' )
  res.status(200).send(item);
}));

/************************************************************************
  POST /api/listitem/

  Post one or many new list items if has list edit permission.

  Return status: 201, 400 invalid json, 401, 403

*************************************************************************/
listItemRouter.post('', asyncHandler(async (req, res) => {
  const item = await listItemControler.insertMany(req.body);
  res.status(201).send(item);
}));

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
listItemRouter.patch('/:itemid', asyncHandler(async (req, res) => {
  const newitem = await listItemControler.patch(req.params.itemid, req.body);
  res.status(200).send(newitem);
}));

/************************************************************************
  DELETE /api/listitem/ 
  
  Delete all listsItems! For testing purpose only
  
  Status: 200, 400 invalid json, 401, 403

*************************************************************************/
listItemRouter.delete('', asyncHandler(async (req, res) => {
  const result = await listItemControler.deleteAll()  
  // if DELETE fails let the server default error handler return 500
  if (result.acknowledged) {
    res.status(200).send({'deletedCount': result.deletedCount});
}
}));
/************************************************************************
  DELETE /api/listitem/:itemid  // Delete one or many list items if has list edit permission
                                // Status: 200, 400 invalid json, 401, 403

*************************************************************************/
    
module.exports = listItemRouter;

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

