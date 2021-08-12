const express = require('express');
const listItemRouter = express.Router();
const listItemControler = require('./listItemControler');

const asyncHandler = require('express-async-handler')

/************************************************************************
  GET /api/listitem/:itemid

  Get a list item by id if has list read permission.

  Return status: 200, 400 invalid or invalid listid, 401, 403

*************************************************************************/
listItemRouter.get('/:itemid', asyncHandler(async (req, res) => {
  const item = await listItemControler.findOne(req.params.itemid)
  res.status(200).send(item);
}));

/************************************************************************
  POST /api/listitem/

  Post one or many new list items if has list edit permission.

  Return status: 201, 400 invalid json, 401, 403

*************************************************************************/
listItemRouter.post('', asyncHandler(async (req, res) => {
  const item = await listItemControler.insert(req.body);
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

