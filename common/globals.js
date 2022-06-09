let Globals = {
  voidListId: "000000000000000000000000",
  listOfAllListId: "000000000000000000000001",
  listOfAllViewId: "000000000000000000000002",
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
  usernameMinLength: 6,
  passwordMinLength: 8,
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

  adminUserName: "administrator",
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

  permissionDenied: "Permission denied",
  permissionDeniedOnListOrItems: "permission_denied",

  addOptionalPropertyMenu: "Add Optional Property",
  noOptionalPropertyToAddMenu: "No Optional Property to Add",

  noPermissionViewList: "You do not have the permission to view this list...",
  noPermissionViewItems:
    "You do not have the permission to view items from this list...",
  noItemsInList: "There are no items in this list yet...",
};

Globals = {
  ...Globals,
  specialUsers: [
    Globals.ownerUserName,
    Globals.authUserName,
    Globals.allUserName,
  ],

  listOfAllLists: {
    [Globals.itemIdFieldName]: Globals.listOfAllListId,
    [Globals.nameFieldName]: "List of all lists",
    [Globals.ownerFieldName]: Globals.adminUserName,
    [Globals.itemCreatePermFieldName]: Globals.authUserName,
    [Globals.listSchemaFieldName]:
      `{` +
      `${Globals.nameFieldName}: {type: string, required, default: 'List Name'}, ` +
      `${Globals.ownerFieldName}: {type: user, required}, ` +
      `${Globals.readPermFieldName}: {type: user_list, lower, default: ${Globals.allUserName}}, ` +
      `${Globals.readWritePermFieldName}: {type: user_list, lower, default: ${Globals.ownerUserName}}, ` +
      `${Globals.itemCreatePermFieldName}: {type: user_list, lower, default: ${Globals.authUserName}}, ` +
      `${Globals.itemReadPermFieldName}: {type: user_list, lower, default: ${Globals.allUserName}}, ` +
      `${Globals.itemReadWritePermFieldName}: {type: user_list, lower, default: ${Globals.ownerUserName}}, ` +
      `${Globals.listSchemaFieldName}: {type: schema, required, default: 'prop1: string'}` +
      `}`,
  },

  listOfAllViews: {
    [Globals.itemIdFieldName]: Globals.listOfAllViewId,
    [Globals.nameFieldName]: "List of all views",
    [Globals.ownerFieldName]: Globals.adminUserName,
    [Globals.itemCreatePermFieldName]: Globals.authUserName,
    [Globals.listSchemaFieldName]:
      `{` +
      `${Globals.nameFieldName}: {type: string, required, default: 'View Name'}, ` +
      `${Globals.ownerFieldName}: {type: user, required},` +
      `${Globals.readPermFieldName}: {type: user_list, lower, default: ${Globals.allUserName}}, ` +
      `${Globals.readWritePermFieldName}: {type: user_list, lower, default: ${Globals.ownerUserName}}, ` +
      `${Globals.addItemModeFieldName}: {type: string, options: ['${Globals.addItemModeDefault}', '${Globals.addItemModeAsForm}', '${Globals.addWithPersistentFormAndItems}', '${Globals.addWithPersistentFormNoItems}'], default: ${Globals.addItemModeDefault}}, ` +
      `${Globals.itemTemplateFieldName}: template,` +
      `${Globals.childlistFieldName}: embedded_listid` +
      `}`,
  },

  listOfUsers: {
    [Globals.itemIdFieldName]: Globals.userListId,
    [Globals.nameFieldName]: "List of users",
    [Globals.ownerFieldName]: Globals.adminUserName,
    [Globals.itemCreatePermFieldName]: Globals.allUserName,
    [Globals.listSchemaFieldName]:
      `username: {type: user, required, unique, ${Globals.noDefault}}, ` +
      `${Globals.emailFieldName}: {type: email, required, unique, lower, ${Globals.noDefault}}, ` +
      `password: {type: encrypted_string, required, minlength: ${Globals.passwordMinLength}, ${Globals.noDefault}}`,
  },

  viewOnTheListOfAllLists: {
    [Globals.itemIdFieldName]: Globals.viewOnAllListViewId,
    [Globals.nameFieldName]: "Lists",
    [Globals.ownerFieldName]: Globals.adminUserName,
    [Globals.childlistFieldName]: Globals.listOfAllListId,
  },

  viewOnTheListOfAllViews: {
    [Globals.itemIdFieldName]: Globals.viewOnAllViewViewId,
    [Globals.nameFieldName]: "Views",
    [Globals.ownerFieldName]: Globals.adminUserName,
    [Globals.itemTemplateFieldName]: `<Viewlink text={name} viewid={${Globals.itemIdFieldName}}/>`,
    [Globals.childlistFieldName]: Globals.listOfAllViewId,
  },

  viewOnTheListOfUsers: {
    [Globals.itemIdFieldName]: Globals.viewOnUserListViewId,
    [Globals.nameFieldName]: "Users (add with default values)",
    [Globals.ownerFieldName]: Globals.adminUserName,
    [Globals.childlistFieldName]: Globals.userListId,
  },

  signUpViewOnTheListOfUsers: {
    [Globals.itemIdFieldName]: Globals.signUpViewOnUserListViewId,
    [Globals.nameFieldName]: "Sign Up (persistent form without items)",
    [Globals.ownerFieldName]: Globals.adminUserName,
    [Globals.addItemModeFieldName]: Globals.addWithPersistentFormNoItems,
    [Globals.childlistFieldName]: Globals.userListId,
  },

  viewOnTheListOfUsersAtLoad: {
    [Globals.itemIdFieldName]: (
      Globals.voidListId +
      (Globals.signUpViewOnUserListViewId * 1 + 1)
    ).slice(-24),
    [Globals.nameFieldName]: "Users (persistent form with items)",
    [Globals.ownerFieldName]: Globals.adminUserName,
    [Globals.addItemModeFieldName]: Globals.addWithPersistentFormAndItems,
    [Globals.childlistFieldName]: Globals.userListId,
  },

  viewOnTheListOfUsersAsForm: {
    [Globals.itemIdFieldName]: (
      Globals.voidListId +
      (Globals.signUpViewOnUserListViewId * 1 + 2)
    ).slice(-24),
    [Globals.nameFieldName]: "Users (add with form)",
    [Globals.ownerFieldName]: Globals.adminUserName,
    [Globals.addItemModeFieldName]: Globals.addItemModeAsForm,
    [Globals.childlistFieldName]: Globals.userListId,
  },
};

module.exports = Globals;
