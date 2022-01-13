require("dotenv").config();

var Globals = {
  voidListId: "000000000000000000000000",
  listofAllListId: "000000000000000000000001",
  listofAllViewId: "000000000000000000000002",
  userListId: "000000000000000000000003",
  viewOnAllViewViewId: "000000000000000000000004",
  viewOnUserListViewId: "000000000000000000000005",

  itemIdFieldName: "_id", // do not change
  listIdFieldName: "_listid",
  ownerFieldName: "owner",
  listSchemaFieldName: "listschema",
  readWritePermFieldName: "readwritep",
  itemReadWritePermFieldName: "itemreadwritep",
  itemReadPermFieldName: "itemreadp",
  mongoCollectionName: "items",
  mongoDatabaseName: "listitdata",
  APIKeyword: "opentables",
  unauthUserName: "@unauth",

  identifierRegEx: "\\$?[a-zA-Z0-9_-]+",
};

Globals = {
  ...Globals,
  listOfAllLists: {
    [Globals.itemIdFieldName]: Globals.listofAllListId,
    name: "List of all lists",
    [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
    [Globals.readWritePermFieldName]: "@owner",
    [Globals.itemReadWritePermFieldName]: "@all",
    [Globals.itemReadPermFieldName]: "@all",
    [Globals.listSchemaFieldName]:
      "{" +
      "name: {type: string, required}, " +
      Globals.ownerFieldName + ": {type: user, required}, " +
      Globals.readWritePermFieldName + ":  {type: user_list, required, lower}, " +
      Globals.itemReadWritePermFieldName + ":  {type: user_list, required, lower}, " +
      Globals.itemReadPermFieldName + ":  {type: user_list, required, lower}, " +
      Globals.listSchemaFieldName + ":  {type: schema, lower}" +
      "}",
  },
  listOfAllViews: {
    [Globals.itemIdFieldName]: Globals.listofAllViewId,
    name: "List of all views",
    [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
    [Globals.readWritePermFieldName]: "@owner",
    [Globals.itemReadWritePermFieldName]: "@all",
    [Globals.itemReadPermFieldName]: "@all",
    [Globals.listSchemaFieldName]:
      "{" +
      "name: {type: string, required}, " +
      Globals.ownerFieldName + ": {type: user, required},  " +
      Globals.readWritePermFieldName + ":  {type: user_list, required, lower},  " +
      "item_template: template, " +
      "_childlist: embedded_listid" +
      "}",
  },
  listOfUsers: {
    [Globals.itemIdFieldName]: Globals.userListId,
    name: "List of all users",
    [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
    [Globals.readWritePermFieldName]: "@owner",
    [Globals.itemReadWritePermFieldName]: "@owner",
    [Globals.itemReadPermFieldName]: "@all",
    [Globals.listSchemaFieldName]:
      "firstname: string, lastname: string, organisation: string, email: {type: email, required, unique, lower}, password: encrypted_string",
  },
  viewOnTheListOfUsers: {
    [Globals.itemIdFieldName]: Globals.viewOnUserListViewId,
    name: "View on the list of users",
    [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
    [Globals.readWritePermFieldName]: "@owner",
    item_template: "",
    _childlist: Globals.userListId,
  },
  viewOnTheListOfAllViews: {
    [Globals.itemIdFieldName]: Globals.viewOnAllViewViewId,
    name: "View on the list of all views",
    [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
    [Globals.readWritePermFieldName]: "@owner",
    item_template: "",
    _childlist: Globals.listofAllViewId,
  },
};

module.exports = Globals;
