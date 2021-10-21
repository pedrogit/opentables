const MongoDB = require('mongodb');
require('dotenv').config()

var Globals = {
    'voidListId': '000000000000000000000000',
    'listofAllListId': '000000000000000000000001',
    'listofAllViewId': '000000000000000000000002',
    'userListId':      '000000000000000000000003',
    'itemIdFieldName':'_id', // do not change
    'parentIdFieldName':'_parentid',
    'ownerFieldName': 'owner',
    'listSchemaFieldName': 'listschema',
    'listConfPermFieldName': 'listcperm',
    'listWritePermFieldName': 'listwperm',
    'listReadPermFieldName': 'listrperm',
    'mongoCollectionName': 'listitem',
    'mongoDatabaseName': 'listitdata',
    'listitemAPIKeyword': 'listitem',
    'unauthUserName': '@unauth'
}

Globals = {
    ...Globals,
    listOfAllLists: {
        //[Globals.itemIdFieldName]: MongoDB.ObjectId(Globals.listofAllListId),
        //[Globals.parentIdFieldName]: MongoDB.ObjectId(Globals.voidListId),
        [Globals.itemIdFieldName]: Globals.listofAllListId,
        [Globals.parentIdFieldName]: Globals.voidListId,
        name: 'List of all lists',
        [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
        [Globals.listConfPermFieldName]: '@listowner',
        [Globals.listWritePermFieldName]: '@all',
        [Globals.listReadPermFieldName]: '@all',
        [Globals.listSchemaFieldName]: '{' 
          + Globals.itemIdFieldName + ': objectid, '
          + Globals.parentIdFieldName + ': {type: objectid, required}, '
          + 'name: {type: string, required}, '
          + Globals.ownerFieldName + ': {type: user, required}, '
          + Globals.listConfPermFieldName + ':  {type: user_array, required, lower}, '
          + Globals.listWritePermFieldName + ':  {type: user_array, required, lower}, '
          + Globals.listReadPermFieldName + ':  {type: user_array, required, lower}, '
          + Globals.listSchemaFieldName + ':  {type: schema, lower}'
          + '}'
      },
      listOfAllViews: {
        //[Globals.itemIdFieldName]: MongoDB.ObjectId(Globals.listofAllViewId),
        //[Globals.parentIdFieldName]: MongoDB.ObjectId(Globals.voidListId),
        [Globals.itemIdFieldName]: Globals.listofAllViewId,
        [Globals.parentIdFieldName]: Globals.voidListId,
        name: 'List of all views',
        [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
        [Globals.listConfPermFieldName]: '@listowner',
        [Globals.listWritePermFieldName]: '@all',
        [Globals.listReadPermFieldName]: '@all',
        [Globals.listSchemaFieldName]: '{' 
          + Globals.itemIdFieldName + ': objectid, '
          + Globals.parentIdFieldName + ': {type: objectid, required}, '
          + 'name: {type: string, required}, '
          + Globals.ownerFieldName + ': {type: user, required},  '
          + Globals.listConfPermFieldName + ':  {type: user_array, required, lower},  '
          + 'item_template: string, '
          + '_childlistid: {type: objectid_array, listid: "' + Globals.listofAllListId + '", min_occ: 1, max_occ:1, inc_props: "all"}'
          + '}'
      },
      listOfUsers: {
        //[Globals.itemIdFieldName]: MongoDB.ObjectId(Globals.userListId),
        //[Globals.parentIdFieldName]: MongoDB.ObjectId(Globals.listofAllListId),
        [Globals.itemIdFieldName]: Globals.userListId,
        [Globals.parentIdFieldName]: Globals.listofAllListId,
        name: 'List of all users',
        [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
        [Globals.listConfPermFieldName]: '@listowner',
        [Globals.listWritePermFieldName]: '@listowner',
        [Globals.listReadPermFieldName]: '@listowner',
        [Globals.listSchemaFieldName]: 'firstname: string, lastname: string, organisation: string, email: {type: email, required, unique, lower}, password: encrypted_string'
      }
}

module.exports = Globals;