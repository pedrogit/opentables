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
  childlistFieldName: "_childlist",

  readPermFieldName: "r_permissions",
  readWritePermFieldName: "rw_permissions",
  itemCreatePermFieldName: "item_c_permissions",
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

  addItemModeFieldName: "add_item_mode",
  addItemModeDefault: "default_values",
  addItemModeAsForm: "form",
  addItemModeAtLoadWithItems: "form_at_load",
  addItemModeAtLoadWithoutItems: "form_at_load_no_items"
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
      Globals.itemCreatePermFieldName + ": {type: user_list, lower, default: " + Globals.allUserName + "}, " +
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
      Globals.addItemModeFieldName + ": {type: string, options: [" + Globals.addItemModeDefault + ", " + Globals.addItemModeAsForm + ", " + Globals.addItemModeAtLoadWithItems + "," + Globals.addItemModeAtLoadWithoutItems + "], default: " + Globals.addItemModeDefault + "}, " +
      "item_template: template, " +
      Globals.childlistFieldName + ": embedded_listid" +
      "}",
  },

  listOfUsers: {
    [Globals.itemIdFieldName]: Globals.userListId,
    name: "List of users",
    [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
    [Globals.itemCreatePermFieldName]: Globals.allUserName,
    [Globals.listSchemaFieldName]:
      "username: {type: string, required}, " + Globals.emailFieldName + ": {type: email, required, unique, lower}, password: encrypted_string",
  },

  viewOnTheListOfAllViews: {
    [Globals.itemIdFieldName]: Globals.viewOnAllViewViewId,
    name: "Views",
    [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
    item_template: "<Listlink text={name} listid={" + Globals.itemIdFieldName + "}/>",
    [Globals.childlistFieldName]: Globals.listofAllViewId,
  },
  
  viewOnTheListOfUsers: {
    [Globals.itemIdFieldName]: Globals.viewOnUserListViewId,
    name: "Users (add default)",
    [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
    item_template: "",
    [Globals.childlistFieldName]: Globals.userListId,
  },

  signUpViewOnTheListOfUsers: {
    [Globals.itemIdFieldName]: Globals.signUpViewOnUserListViewId,
    name: "Sign Up (add at load without items)",
    [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
    [Globals.addItemModeFieldName]: Globals.addItemModeAtLoadWithoutItems,
    item_template: "<Text val={username} inline/><Text val={" + Globals.emailFieldName + "} label=\"Email\" inline /><Text val={password} inline/>",
    [Globals.childlistFieldName]: Globals.userListId,
  },

  viewOnTheListOfUsersAtLoad: {
    [Globals.itemIdFieldName]: (Globals.voidListId + (Globals.signUpViewOnUserListViewId *1 + 1)).slice(-24),
    name: "Users (add at load)",
    [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
    [Globals.addItemModeFieldName]: Globals.addItemModeAtLoadWithItems,
    item_template: "",
    [Globals.childlistFieldName]: Globals.userListId,
  },

  viewOnTheListOfUsersAsForm: {
    [Globals.itemIdFieldName]: (Globals.voidListId + (Globals.signUpViewOnUserListViewId *1 + 2)).slice(-24),
    name: "Users (add as form)",
    [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
    [Globals.addItemModeFieldName]: Globals.addItemModeAsForm,
    item_template: "",
    [Globals.childlistFieldName]: Globals.userListId,
  }
};

module.exports = Globals;
