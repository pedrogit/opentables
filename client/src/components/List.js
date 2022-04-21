import React from "react";
import Item from "./Item";
import Stack from "@mui/material/Stack";

import getUser from "../clientUtils";
const Schema = require("../common/schema");

const Utils = require("../common/utils");
const Globals = require("../common/globals");

// a list receive a view and a list of items
function List({
  listType,
  view,
  listSchemaStr,
  setLoginState,
  setViewId,
  setViewData,
  setAddItem,
  addItem,
  setErrorMsg,
  showDeleteButton = true,
  handleReload,
  sx
}) {
  // set a default value for addItemMode
  var addItemMode = (view && view[Globals.addItemModeFieldName]) || Globals.addItemModeDefault;

  const handleAddItem = React.useCallback(
    ({item = {}, addToLocalList = true, callback} = {}) => {
      if (view[Globals.childlistFieldName]) {
        setLoginState({
          open: false,
          msg: {
            severity: "warning",
            title: Globals.permissionDenied,
            text: 'You do not have permissions to add items to this list. Please login with valid credentials...'
          },
          action: {
            method: "post",
            url: "http://localhost:3001/api/opentables/" + view[Globals.childlistFieldName][Globals.itemIdFieldName],
            data: item,
            callback: (success, newitem) => {
              if (success && addToLocalList) {
                var newItemsData = view[Globals.childlistFieldName][Globals.itemsFieldName];
                if (!newItemsData) {
                  newItemsData = [];
                }
                newItemsData.unshift(newitem);
                setViewData({
                  ...view,
                  [Globals.childlistFieldName]: {
                    ...view[Globals.childlistFieldName],
                    [Globals.itemsFieldName]: newItemsData
                  }
                });
              }
              if (callback && typeof callback === 'function') {
                callback(success, newitem);
              }
            }
          },
          tryFirst: true
        });
      }
      else {
        setErrorMsg({text: "No list is associated to this view. You can not add items..."});
      }
    }, [view, setLoginState, setViewData, setErrorMsg]
  );

  // determine user permission on patch and post. Open the login panel otherwise.
  const handleListAuth = React.useCallback(
    ({
      action = 'patch', 
      item = null, 
      propName = '', 
      callback
    }) => {
      var auth = false;
      if (action === "patch") {
        auth = Utils.validateRWPerm({
          user: getUser(),
          list: view[Globals.childlistFieldName],
          item: item,
          throwError: false
        });
      }
      else if (action === "post") {
        auth = Utils.validateCPerm({
          user: getUser(),
          list: view[Globals.childlistFieldName],
          throwError: false
        });
      }
      
      if (auth) {
        if (callback && typeof callback === 'function') {
          callback(true);
        }
      }
      else {
        // open login dialog
        setLoginState({
          open: true, 
          msg: {
            severity: "warning",
            title: Globals.permissionDenied,
            text:
            'You do not have permissions to edit ' + 
            (propName ? ('"' + propName + '"') : "item") +
            '. Please login with valid credentials...'
          },
          action: {
            method: "get",
            url: "http://localhost:3001/api/opentables/login",
            callback: callback
          },
          tryFirst: false
        });
      }
      return auth;
    }, [view, setLoginState]
  );

  React.useEffect(() => {
    // add a new default item when requested
    if (addItem && 
        addItemMode === Globals.addItemModeDefault &&
        handleListAuth({action: 'post'})) {
      setAddItem(false);
      handleAddItem();
    };
  }, [addItem, addItemMode, setAddItem, handleListAuth, handleAddItem] );

  var parsedSchema;

  if (view) {
    // parse the schema
    parsedSchema = new Schema(view[Globals.childlistFieldName][Globals.listSchemaFieldName]);
  }

  var rowNb = 0;

  // check that the has permission to add an item
  React.useEffect(() => {
    if (addItemMode === Globals.addWithPersistentFormAndItems || 
        addItemMode === Globals.addWithPersistentFormNoItems) {
      handleListAuth({action: 'post'});
    }
  }, [view, addItemMode, setAddItem, handleListAuth] );

  // handle the deletion of an item
  const handleDeleteItem = React.useCallback(
    (itemid, callback) => {
      if (view[Globals.childlistFieldName]) {
        setLoginState({
          open: false,
          msg: {
            severity: "warning",
            title: Globals.permissionDenied,
            text:
            'You do not have permissions to delete items from this list. Please login with valid credentials...',
          },
          action: {
            method: "delete",
            url: "http://localhost:3001/api/opentables/" + itemid,
            callback: (success, data) => {
              if (success) {
                var newItemsData = [...view[Globals.childlistFieldName][Globals.itemsFieldName]];
                newItemsData = newItemsData.filter(item => item[Globals.itemIdFieldName] !== itemid);
                setViewData({
                  ...view,
                  [Globals.childlistFieldName]: {
                    ...view[Globals.childlistFieldName],
                    [Globals.itemsFieldName]: newItemsData
                  }
                });
              }
              if (callback && typeof callback === 'function') {
                callback(success, data);
              }
            }
          },
          tryFirst: true
        });
      }
      else {
        setErrorMsg({text: "No list is associated to this view. You can not delete items..."});
      }
    }, [view, setLoginState, setViewData, setErrorMsg]
  );

  // determine if delete button should be disabled
  const deleteButtonDisabled = (item) => {
    var disabled = view === undefined || view === null || 
                 !(Utils.validateDPerm({
                   user: getUser(),
                   list: view[Globals.childlistFieldName],
                   item: item,
                   throwError: false
                 }));
    return disabled;
  }

  // determine if setUnsetProperty button should be disabled
  const setUnsetPropertyButtonDisabled = (item) => {
    var disabled = view === undefined || view === null || 
                  !(Utils.validateRWPerm({
                    user: getUser(),
                    list: view[Globals.childlistFieldName],
                    item: item,
                    throwError: false
                  }));
    return disabled;
  }

  const handleEditItem = React.useCallback(
    (editedItem, editedProperty) => {
      // if the edited property is part of the view or the list, 
      // reload the list because it generally have an effect on the whole list
      if (listType === Globals.viewListType && editedProperty.includes(Globals.addItemModeFieldName)) {
        handleReload(false);
      }
      else {
        var newItemsData = [...view[Globals.childlistFieldName][Globals.itemsFieldName]];

        var idx = newItemsData.findIndex(
          item => item[Globals.itemIdFieldName] === editedItem[Globals.itemIdFieldName]
        )
        newItemsData[idx] = editedItem;
        setViewData({
          ...view,
          [Globals.childlistFieldName]: {
            ...view[Globals.childlistFieldName],
            [Globals.itemsFieldName]: newItemsData
          }
        });
      }
    }, [listType, view, setViewData, handleReload]
  );

  return (
    <Stack
      id={listType && listType.toLowerCase()}
      sx={sx}
    >
      {((addItem && addItemMode === Globals.addItemModeAsForm) || 
         addItemMode === Globals.addWithPersistentFormAndItems || 
         addItemMode === Globals.addWithPersistentFormNoItems
         ) &&
        <Item
          template={"<ItemWrapperForm handlers={handlers} otherProps={otherProps}>" + (view[Globals.itemTemplateFieldName] || parsedSchema.getDefaultTemplate({hidden: true})) + "</ItemWrapperForm>"}
          listid={view[Globals.childlistFieldName][Globals.itemIdFieldName]}
          item={parsedSchema.getRequiredDefaults({user: getUser()})}
          defItem={parsedSchema.getAllDefaults({user: getUser()})}
          rowNb={0}
          setLoginState={setLoginState}
          handleListAuth={handleListAuth}
          handleAddItem={handleAddItem}
          handleDeleteItem={handleDeleteItem}
          showDeleteButton={false}
          setViewId={setViewId}
          addItemMode={addItemMode}
          setAddItem={setAddItem}
          backToMainView={setViewId}
          setErrorMsg={setErrorMsg}
          addLabel={(view[Globals.itemIdFieldName] === Globals.signUpViewOnUserListViewId ? "Register" : null)}
          addMessageText={(view[Globals.itemIdFieldName] === Globals.signUpViewOnUserListViewId ? "Welcome to OpenTable. You have been logged in..." : null)}
          addMessageTitle={(view[Globals.itemIdFieldName] === Globals.signUpViewOnUserListViewId ? (() => "Congratulation " + getUser() + " !") : null)}
          recaptcha={getUser() === Globals.allUserName}
        />
      }
      {(view && 
       view[Globals.childlistFieldName] && 
       view[Globals.childlistFieldName][Globals.itemsFieldName]) && 
       view[Globals.childlistFieldName][Globals.itemsFieldName].map((item) => {
        rowNb = rowNb + 1;
        return (
          <Item
            key={item[Globals.itemIdFieldName]}
            template={view[Globals.itemTemplateFieldName] || parsedSchema.getDefaultTemplate()}
            listid={view[Globals.childlistFieldName][Globals.itemIdFieldName]}
            item={item}
            defItem={parsedSchema.getAllDefaults({user: getUser(), listSchema: listSchemaStr})}
            unsetProps={parsedSchema.getUnsetProps(item)}
            rowNb={rowNb}
            setLoginState={setLoginState}
            handleListAuth={handleListAuth}
            handleAddItem={handleAddItem}
            handleDeleteItem={handleDeleteItem}
            deleteButtonDisabled={deleteButtonDisabled(item)}
            showDeleteButton={showDeleteButton}
            handleEditItem={handleEditItem}
            setUnsetPropertyButtonDisabled={setUnsetPropertyButtonDisabled(item)}
            setViewId={setViewId}
            setErrorMsg={setErrorMsg}
          />
        );
      })}
    </Stack>
  );
}

export default List;
