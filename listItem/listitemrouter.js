const express = require('express');
const listItemRouter = express.Router();
const listItemControler = require('./listItemControler');

const asyncHandler = require('express-async-handler')

/************************************************************************
  GET /api/listitem/:itemid

  Get a list item by id if has list read permission.

  Return status: 200, 400 invalid or invalid listid, 401, 403

*************************************************************************/
listItemRouter.get('/:itemid', asyncHandler(async (req, res, next) => {
  const item = await listItemControler.findById(req.params.itemid, res, next)
  res.status(200).send(item);
}));

/************************************************************************
  POST /api/listitem/

  Post one or many new list items if has list edit permission.

  Return status: 201, 400 invalid json, 401, 403

*************************************************************************/
listItemRouter.post('', asyncHandler(async (req, res, next) => {
  const item = await listItemControler.create(req.body, res, next);
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
listItemRouter.patch('/:itemid', asyncHandler(async (req, res, next) => {
  const newitem = await listItemControler.patch(req.params.itemid, req.body, res, next);
  res.status(200).send(newitem);
}));

/************************************************************************
  DELETE /api/listitem/:itemid  // Delete one or many list items if has list edit permission
                                // Status: 200, 400 invalid json, 401, 403

*************************************************************************/
    
module.exports = listItemRouter;