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
  const item = await listItemControler.findById(req.params.itemid)
  res.status(200).send(item);
}));

/************************************************************************
  POST /api/listitem/

  Post one or many new list items if has list edit permission.

  Return status: 201, 400 invalid json, 401, 403

*************************************************************************/
listItemRouter.post('', asyncHandler(async (req, res) => {
  const item = await listItemControler.create(req.body);
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
  if (result.ok != 1) {
    next();
  }
  // otherwise send the count of object deleted
  res.status(200).send({'deletedCount': result.deletedCount});
}));
/************************************************************************
  DELETE /api/listitem/:itemid  // Delete one or many list items if has list edit permission
                                // Status: 200, 400 invalid json, 401, 403

*************************************************************************/
    
module.exports = listItemRouter;
