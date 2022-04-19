require("dotenv").config();

var Globals = {
  voidListId: "000000000000000000000000",
  listofAllListId: "000000000000000000000001",
  listofAllViewId: "000000000000000000000002",
  userListId: "000000000000000000000003",
  viewOnAllViewViewId: "000000000000000000000004",
  viewOnAllListViewId: "000000000000000000000005",
  viewOnUserListViewId: "000000000000000000000006",
  signUpViewOnUserListViewId: "000000000000000000000007",

  itemIdFieldName: "_id", // do not change
  listIdFieldName: "_listid",
  ownerFieldName: "owner",
  nameFieldName: "name",
  listSchemaFieldName: "schema",
  usernameFieldName: "username",
  emailFieldName: "email",
  itemTemplateFieldName: "item_template",
  childlistFieldName: "_childlist",
  itemsFieldName: "_items",
  addItemModeFieldName: "add_item_mode",

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

  addItemModeDefault: "default_values",
  addItemModeAsForm: "form",
  addWithPersistentFormAndItems: "persistent_form",
  addWithPersistentFormNoItems: "persistent_form_no_items",

  noDefault: "nodefault",
  gRecaptchaResponse: "g-recaptcha-response",

  viewProperties: "View Properties",
  listProperties: "List Properties",

  viewListType: "viewlist",
  listListType: "listlist",
  itemListType: "itemlist",
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
    [Globals.nameFieldName]: "List of all lists",
    [Globals.ownerFieldName]: process.env.ADMIN_USERNAME,
    [Globals.itemCreatePermFieldName]: Globals.allUserName,
    [Globals.listSchemaFieldName]:
      "{" +
      Globals.nameFieldName + ": {type: string, required, default: 'List Name'}, " +
      Globals.ownerFieldName + ": {type: user, required}, " +
      Globals.readPermFieldName + ": {type: user_list, lower, default: " + Globals.allUserName + "}, " +
      Globals.readWritePermFieldName + ": {type: user_list, lower, default: " + Globals.ownerUserName + "}, " +
      Globals.itemCreatePermFieldName + ": {type: user_list, lower, default: " + Globals.allUserName + "}, " +
      Globals.itemReadPermFieldName + ": {type: user_list, lower, default: " + Globals.allUserName + "}, " +
      Globals.itemReadWritePermFieldName + ": {type: user_list, lower, default: " + Globals.ownerUserName + "}, " +
      Globals.listSchemaFieldName + ": {type: schema, required, default: 'prop1: string'}" +
      "}",
  },

  listOfAllViews: {
    [Globals.itemIdFieldName]: Globals.listofAllViewId,
    [Globals.nameFieldName]: "List of all views",
    [Globals.ownerFieldName]: process.env.ADMIN_USERNAME,
    [Globals.itemCreatePermFieldName]: Globals.allUserName,
    [Globals.listSchemaFieldName]:
      "{" +
      Globals.nameFieldName + ": {type: string, required, default: 'View Name'}, " +
      Globals.ownerFieldName + ": {type: user, required}, " +
      Globals.readPermFieldName + ": {type: user_list, lower, default: " + Globals.allUserName + "}, " +
      Globals.readWritePermFieldName + ": {type: user_list, lower, default: " + Globals.ownerUserName + "}, " +
      Globals.addItemModeFieldName + ": {type: string, options: ['" + Globals.addItemModeDefault + "', '" + 
                                                                     Globals.addItemModeAsForm + "', '" + 
                                                                     Globals.addWithPersistentFormAndItems + "', '" + 
                                                                     Globals.addWithPersistentFormNoItems + 
                                                                "'], default: " + Globals.addItemModeDefault + "}, " +
      Globals.itemTemplateFieldName + ": template, " +
      Globals.childlistFieldName + ": embedded_listid" +
      "}",
  },

  listOfUsers: {
    [Globals.itemIdFieldName]: Globals.userListId,
    [Globals.nameFieldName]: "List of users",
    [Globals.ownerFieldName]: process.env.ADMIN_USERNAME,
    [Globals.itemCreatePermFieldName]: Globals.allUserName,
    [Globals.listSchemaFieldName]:
      "username: {type: string, required, unique, minlength: 6," + Globals.noDefault + "}, " + 
      Globals.emailFieldName + ": {type: email, required, unique, lower, " + Globals.noDefault + "}, " + 
      "password: {type: encrypted_string, required, minlength: 8, " + Globals.noDefault + "}",
  },

  viewOnTheListOfAllLists: {
    [Globals.itemIdFieldName]: Globals.viewOnAllListViewId,
    [Globals.nameFieldName]: "Lists",
    [Globals.ownerFieldName]: process.env.ADMIN_USERNAME,
    [Globals.childlistFieldName]: Globals.listofAllListId,
  },

  viewOnTheListOfAllViews: {
    [Globals.itemIdFieldName]: Globals.viewOnAllViewViewId,
    [Globals.nameFieldName]: "Views",
    [Globals.ownerFieldName]: process.env.ADMIN_USERNAME,
    [Globals.itemTemplateFieldName]: "<Viewlink text={name} viewid={" + Globals.itemIdFieldName + "}/>",
    [Globals.childlistFieldName]: Globals.listofAllViewId,
  },
  
  viewOnTheListOfUsers: {
    [Globals.itemIdFieldName]: Globals.viewOnUserListViewId,
    [Globals.nameFieldName]: "Users (add with default values)",
    [Globals.ownerFieldName]: process.env.ADMIN_USERNAME,
    [Globals.childlistFieldName]: Globals.userListId,
  },

  signUpViewOnTheListOfUsers: {
    [Globals.itemIdFieldName]: Globals.signUpViewOnUserListViewId,
    [Globals.nameFieldName]: "Sign Up (persistent form without items)",
    [Globals.ownerFieldName]: process.env.ADMIN_USERNAME,
    [Globals.addItemModeFieldName]: Globals.addWithPersistentFormNoItems,
    [Globals.childlistFieldName]: Globals.userListId,
  },

  viewOnTheListOfUsersAtLoad: {
    [Globals.itemIdFieldName]: (Globals.voidListId + (Globals.signUpViewOnUserListViewId *1 + 1)).slice(-24),
    [Globals.nameFieldName]: "Users (persistent form with items)",
    [Globals.ownerFieldName]: process.env.ADMIN_USERNAME,
    [Globals.addItemModeFieldName]: Globals.addWithPersistentFormAndItems,
    [Globals.childlistFieldName]: Globals.userListId,
  },

  viewOnTheListOfUsersAsForm: {
    [Globals.itemIdFieldName]: (Globals.voidListId + (Globals.signUpViewOnUserListViewId *1 + 2)).slice(-24),
    [Globals.nameFieldName]: "Users (add with form)",
    [Globals.ownerFieldName]: process.env.ADMIN_USERNAME,
    [Globals.addItemModeFieldName]: Globals.addItemModeAsForm,
    [Globals.childlistFieldName]: Globals.userListId,
  }
};

module.exports = Globals;
