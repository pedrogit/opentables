import React from "react";
import Item from "./Item";
import Stack from "@mui/material/Stack";

import getUser from "../clientUtils";
//const Schema = require("../common/schema");
const TemplateParser = require("../common/templateParser");
const Utils = require("../common/utils");
const Globals = require("../common/globals");
var _ = require('lodash');

// a list receive a view and a list of items
function List({
  listType,
  view,
  parsedSchema,
  listSchemaStr,
  setLoginState,
  setViewId,
  setViewData,
  setAddItem,
  addItem,
  setErrorMsg,
  showDeleteButton = true,
  handleReload,
  handleRefresh,
  sx
}) {
  const [editingItem, setEditingItem] = React.useState(parsedSchema.getRequiredDefaults({user: getUser()}));
  const [oldParsedSchema, setOldParsedSchema] = React.useState(parsedSchema);
  // set a default value for addItemMode
  var addItemMode = (view && view[Globals.addItemModeFieldName]) || Globals.addItemModeDefault;

  const resetEditingItem = React.useCallback(
    () => {
      setEditingItem(parsedSchema.getRequiredDefaults({user: getUser()}));
    }, [parsedSchema, setEditingItem]
  );

  // compute a default item for form mode
  React.useEffect(() => {
    if (!(_.isEqual(parsedSchema, oldParsedSchema))) {
      resetEditingItem();
      setOldParsedSchema(parsedSchema);
    }
  }, [parsedSchema, oldParsedSchema, resetEditingItem]);

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
                resetEditingItem();
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
    }, [view, setLoginState, setViewData, setErrorMsg, resetEditingItem]
  );

  // determine user permission on patch and post. Open the login panel otherwise.
  const checkListEditPerm = React.useCallback(
    ({
      item = null, 
      propName = '', 
      callback
    }) => {
      if (Utils.validateRWPerm({
        user: getUser(),
        list: view[Globals.childlistFieldName],
        item: item
      })) {
        if (callback && typeof callback === 'function') {
          callback(true);
        }
        return true;
      }
      else {
        // open login dialog
        setLoginState({
          open: true, 
          msg: {
            severity: "warning",
            title: Globals.permissionDenied,
            text:
            'You do not have permissions to edit "' + propName + '". Please login with valid credentials...'
          },
          action: {
            method: "get",
            url: "http://localhost:3001/api/opentables/login",
            callback: callback
          },
          tryFirst: false
        });
      }
      return false;
    }, [view, setLoginState]
  );

  React.useEffect(() => {
    // add a new default item when hitting the add button
    if (addItem && addItemMode === Globals.addItemModeDefault) {
      setAddItem(false);
      handleAddItem();
    };
  }, [addItem, addItemMode, setAddItem, handleAddItem] ); 

  // check that the has permission to add an item
  React.useEffect(() => {
    if (addItemMode === Globals.addWithPersistentFormNoItems &&
        !Utils.validateCPerm({
          user: getUser(),
          list: view[Globals.childlistFieldName]
        })) {
      // open login dialog
      setLoginState({
        open: true, 
        msg: {
          severity: "warning",
          title: Globals.permissionDenied,
          text: 'You do not have permissions to add new items. Please login with valid credentials...'        },
        action: {
          method: "get",
          url: "http://localhost:3001/api/opentables/login",
          callback: handleRefresh
        },
        tryFirst: false
      });
    }
  }, [view, addItemMode, handleRefresh, setLoginState] );

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
                   item: item
                 }));
    return disabled;
  }

  // determine if setUnsetProperty button should be disabled
  const setUnsetPropertyButtonDisabled = (item) => {
    var disabled = view === undefined || view === null || 
                  !(Utils.validateRWPerm({
                    user: getUser(),
                    list: view[Globals.childlistFieldName],
                    item: item
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

  const getUnsetProperties = (item) => {
    var unsetProps = parsedSchema.getUnsetProps(item);
    if (view[Globals.itemTemplateFieldName]) {
      const tParser = new TemplateParser(view[Globals.itemTemplateFieldName]);
      var templateProps = tParser.getUsedProperties();
      unsetProps = unsetProps.filter(prop => templateProps.includes(prop));
    }
    return unsetProps;
  }

  var rowNb = 0;
  return (
    <Stack
      id={listType && listType.toLowerCase()}
      sx={sx}
    >
      {(editingItem && 
        (
          (addItem && addItemMode === Globals.addItemModeAsForm) || 
          addItemMode === Globals.addWithPersistentFormAndItems || 
          addItemMode === Globals.addWithPersistentFormNoItems
        ) &&
        Utils.validateCPerm({
          user: getUser(),
          list: view[Globals.childlistFieldName]
        })
       ) &&
        <Item
          template={"<ItemWrapperForm handlers={handlers} otherProps={otherProps}>" + (view[Globals.itemTemplateFieldName] || parsedSchema.getDefaultTemplate({hidden: true})) + "</ItemWrapperForm>"}
          listid={view[Globals.childlistFieldName][Globals.itemIdFieldName]}
          item={editingItem}
          defItem={parsedSchema.getAllDefaults({user: getUser()})}
          unsetProps={getUnsetProperties(editingItem)}
          rowNb={0}
          setLoginState={setLoginState}
          checkListEditPerm={checkListEditPerm}
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
          setEditingItem={setEditingItem}
          resetEditingItem={resetEditingItem}
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
            unsetProps={getUnsetProperties(item)}
            rowNb={rowNb}
            setLoginState={setLoginState}
            checkListEditPerm={checkListEditPerm}
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
