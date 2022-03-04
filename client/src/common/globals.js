require("dotenv").config();

var Globals = {
  voidListId: "000000000000000000000000",
  listofAllListId: "000000000000000000000001",
  listofAllViewId: "000000000000000000000002",
  userListId: "000000000000000000000003",
  viewOnAllViewViewId: "000000000000000000000004",
  viewOnUserListViewId: "000000000000000000000005",
  signUpViewOnUserListViewId: "000000000000000000000006",

  itemIdFieldName: "_id", // do not change
  listIdFieldName: "_listid",
  ownerFieldName: "owner",
  listSchemaFieldName: "listschema",
  emailFieldName: "owner",

  readPermFieldName: "r_permissions",
  readWritePermFieldName: "rw_permissions",
  itemReadPermFieldName: "item_r_permissions",
  itemReadWritePermFieldName: "item_rw_permissions",

  mongoCollectionName: "items",
  mongoDatabaseName: "listitdata",
  
  APIKeyword: "opentables",
  browserHistoryKey: "otviews",

  ownerUserName: "@owner",
  authUserName: "@auth", // all authenticated users
  allUserName: "@all", // non authenticated users

  identifierRegEx: "\\$?[a-zA-Z0-9_-]+",
};

Globals = {
  ...Globals,
  specialUsers: [
    Globals.ownerUserName, 
    Globals.authUserName, 
    Globals.allUserName
  ],
  listOfAllLists: {
    [Globals.itemIdFieldName]: Globals.listofAllListId,
    name: "List of all lists",
    [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
    [Globals.listSchemaFieldName]:
      "{" +
      "name: {type: string, required, default: 'List name'}, " +
      Globals.ownerFieldName + ": {type: user, required}, " +
      Globals.readPermFieldName + ": {type: user_list, lower, default: " + Globals.allUserName + "}, " +
      Globals.readWritePermFieldName + ": {type: user_list, lower, default: " + Globals.ownerUserName + "}, " +
      Globals.itemReadPermFieldName + ": {type: user_list, lower, default: " + Globals.allUserName + "}, " +
      Globals.itemReadWritePermFieldName + ": {type: user_list, lower, default: " + Globals.ownerUserName + "}, " +
      Globals.listSchemaFieldName + ": {type: schema, default: 'prop1: string'}" +
      "}",
  },
  listOfAllViews: {
    [Globals.itemIdFieldName]: Globals.listofAllViewId,
    name: "List of all views",
    [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
    [Globals.listSchemaFieldName]:
      "{" +
      "name: {type: string, required, default: 'View name'}, " +
      Globals.ownerFieldName + ": {type: user, required}, " +
      Globals.readPermFieldName + ": {type: user_list, lower, default: " + Globals.allUserName + "}, " +
      Globals.readWritePermFieldName + ": {type: user_list, lower, default: " + Globals.ownerUserName + "}, " +
      "add_item_mode: {type: string, options: [default_values, form_values, form_values_only], default: default_values}, " +
      "item_template: template, " +
      "_childlist: embedded_listid" +
      "}",
  },
  listOfUsers: {
    [Globals.itemIdFieldName]: Globals.userListId,
    name: "List of users",
    [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
    [Globals.listSchemaFieldName]:
      "username: {type: string, required}, " + Globals.emailFieldName + ": {type: email, required, unique, lower}, password: encrypted_string",
  },
  viewOnTheListOfUsers: {
    [Globals.itemIdFieldName]: Globals.viewOnUserListViewId,
    name: "Users",
    [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
    item_template: "",
    _childlist: Globals.userListId,
  },
  signUpViewOnTheListOfUsers: {
    [Globals.itemIdFieldName]: Globals.signUpViewOnUserListViewId,
    name: "Sign Up",
    [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
    add_item_mode: "form_values_only", // default_values, form_values, form_values_only, 
    item_template: "<Text val={username}/><Text val={" + Globals.emailFieldName + "} label=\"Email\"/><Text val={password}/>",
    _childlist: Globals.userListId,
  },
  viewOnTheListOfAllViews: {
    [Globals.itemIdFieldName]: Globals.viewOnAllViewViewId,
    name: "Views",
    [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
    item_template: "<Listlink text={name} listid={_id}/>",
    _childlist: Globals.listofAllViewId,
  },
};

module.exports = Globals;
