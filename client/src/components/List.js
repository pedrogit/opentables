import React from "react";
import Stack from "@mui/material/Stack";
import { isEqual } from "lodash";

import Item from "./Item";
import { UncontrolledErrorPanel } from "./ErrorPanel";
import { getUser } from "../clientUtils";

const TemplateParser = require("../../../common/templateParser");
const ValidatePerm = require("../../../common/validatePerm");
const Globals = require("../../../common/globals");

// a list receive a view and a list of items
function List({
  listType,
  view,
  parsedSchema,
  listSchemaStr,
  setAuthAPIRequest,
  setViewId,
  setViewData,
  setAddItem,
  addItem,
  setErrorMsg,
  showDeleteButton = true,
  handleReload,
  handleRefresh,
  sx,
}) {
  const [editingItem, setEditingItem] = React.useState(
    parsedSchema.getRequiredDefaults({ user: getUser() })
  );
  const [oldParsedSchema, setOldParsedSchema] = React.useState(parsedSchema);
  // set a default value for addItemMode
  const addItemMode =
    (view && view[Globals.addItemModeFieldName]) || Globals.addItemModeDefault;

  const resetEditingItem = React.useCallback(() => {
    setEditingItem(parsedSchema.getRequiredDefaults({ user: getUser() }));
  }, [parsedSchema, setEditingItem]);

  // compute a default item for form mode
  React.useEffect(() => {
    if (!isEqual(parsedSchema, oldParsedSchema)) {
      resetEditingItem();
      setOldParsedSchema(parsedSchema);
    }
  }, [parsedSchema, oldParsedSchema, resetEditingItem]);

  const handleAddItem = React.useCallback(
    ({ item = {}, addToLocalList = true, callback } = {}) => {
      if (view[Globals.childlistFieldName]) {
        // if (view[Globals.childlistFieldName] instanceof Array) {
        setAuthAPIRequest({
          method: "post",
          tryBeforeShowLogin: true,
          warningMsg: "add new items to this list",
          urlParams: view[Globals.childlistFieldName][Globals.itemIdFieldName],
          data: item,
          callback: (success, newitem) => {
            if (success && addToLocalList) {
              let newItemsData =
                view[Globals.childlistFieldName][Globals.itemsFieldName];
              if (!newItemsData) {
                newItemsData = [];
              }
              newItemsData.unshift(newitem);
              setViewData({
                ...view,
                [Globals.childlistFieldName]: {
                  ...view[Globals.childlistFieldName],
                  [Globals.itemsFieldName]: newItemsData,
                },
              });
              resetEditingItem();
            }
            if (callback && typeof callback === "function") {
              callback(success, newitem);
            }
          },
        });
      } else {
        setErrorMsg({
          text: "No list is associated to this view. You can not add items...",
        });
      }
    },
    [view, setAuthAPIRequest, setViewData, setErrorMsg, resetEditingItem]
  );

  // determine user permission on patch and post. Open the login panel otherwise.
  const checkListEditPerm = React.useCallback(
    (item) => {
      return ValidatePerm.validateRWPerm({
        user: getUser(),
        list: view[Globals.childlistFieldName],
        item,
      });
    },
    [view]
  );

  React.useEffect(() => {
    // add a new default item when hitting the add button
    if (addItem && addItemMode === Globals.addItemModeDefault) {
      setAddItem(false);
      handleAddItem();
    }
  }, [addItem, addItemMode, setAddItem, handleAddItem]);

  // display the login panel if the user does not have permission
  // to add an item in persistent form no item mode
  React.useEffect(() => {
    if (
      addItemMode === Globals.addWithPersistentFormNoItems &&
      !ValidatePerm.validateCPerm({
        user: getUser(),
        list: view[Globals.childlistFieldName],
      })
    ) {
      // open login dialog
      setAuthAPIRequest({
        method: "get",
        tryBeforeShowLogin: false,
        warningMsg: "add new items to this list",
        urlParams: "login",
        callback: handleRefresh,
      });
    }
  }, [view, addItemMode, handleRefresh, setAuthAPIRequest]);

  // handle the deletion of an item
  const handleDeleteItem = React.useCallback(
    (itemid, callback) => {
      if (view[Globals.childlistFieldName]) {
        setAuthAPIRequest({
          method: "delete",
          tryBeforeShowLogin: true,
          warningMsg: "delete items from this list",
          urlParams: itemid,
          callback: (success, data) => {
            if (success) {
              let newItemsData = [
                ...view[Globals.childlistFieldName][Globals.itemsFieldName],
              ];
              newItemsData = newItemsData.filter(
                (item) => item[Globals.itemIdFieldName] !== itemid
              );
              setViewData({
                ...view,
                [Globals.childlistFieldName]: {
                  ...view[Globals.childlistFieldName],
                  [Globals.itemsFieldName]: newItemsData,
                },
              });
            }
            if (callback && typeof callback === "function") {
              callback(success, data);
            }
          },
        });
      } else {
        setErrorMsg({
          text: "No list is associated to this view. You can not delete items...",
        });
      }
    },
    [view, setAuthAPIRequest, setViewData, setErrorMsg]
  );

  // determine if delete button should be disabled
  const deleteButtonDisabled = (item) => {
    const disabled =
      view === undefined ||
      view === null ||
      !ValidatePerm.validateDPerm({
        user: getUser(),
        list: view[Globals.childlistFieldName],
        item,
      });
    return disabled;
  };

  // determine if setUnsetProperty button should be disabled
  const setUnsetPropertyButtonDisabled = (item) => {
    const disabled =
      view === undefined ||
      view === null ||
      !ValidatePerm.validateRWPerm({
        user: getUser(),
        list: view[Globals.childlistFieldName],
        item,
      });
    return disabled;
  };

  const requireReload = React.useCallback(
    (editedProperty) => {
      return (
        (listType === Globals.viewListType &&
          editedProperty.includes(Globals.addItemModeFieldName)) ||
        (listType === Globals.listListType &&
          editedProperty.includes(Globals.itemReadPermFieldName)) ||
        (listType === Globals.listListType &&
          editedProperty.includes(Globals.readPermFieldName))
      );
    },
    [listType]
  );

  const handleEditItem = React.useCallback(
    (editedItem, editedProperty) => {
      // if the edited property is part of the view or the list,
      // reload the list because it generally have an effect on the whole list
      if (requireReload(editedProperty)) {
        handleReload(true);
      } else {
        const newItemsData = [
          ...view[Globals.childlistFieldName][Globals.itemsFieldName],
        ];

        const idx = newItemsData.findIndex(
          (item) =>
            item[Globals.itemIdFieldName] ===
            editedItem[Globals.itemIdFieldName]
        );
        newItemsData[idx] = editedItem;
        setViewData({
          ...view,
          [Globals.childlistFieldName]: {
            ...view[Globals.childlistFieldName],
            [Globals.itemsFieldName]: newItemsData,
          },
        });
      }
    },
    [view, setViewData, requireReload, handleReload]
  );

  const getUnsetProperties = (item) => {
    let unsetProps = parsedSchema.getUnsetProps(item);
    if (view[Globals.itemTemplateFieldName]) {
      const tParser = new TemplateParser(view[Globals.itemTemplateFieldName]);
      const templateProps = tParser.getUsedProperties();
      unsetProps = unsetProps.filter((prop) => templateProps.includes(prop));
    }
    return unsetProps;
  };

  const noItemsRPerm =
    view[Globals.childlistFieldName][Globals.itemsFieldName] ===
    Globals.permissionDeniedOnListOrItems;
  const emptyList =
    noItemsRPerm ||
    (view[Globals.childlistFieldName][Globals.itemsFieldName] instanceof
      Array &&
      view[Globals.childlistFieldName][Globals.itemsFieldName].length === 0);
  let rowNb = 0;

  return (
    <Stack id={listType && listType.toLowerCase()} sx={sx}>
      {editingItem &&
        ((addItem && addItemMode === Globals.addItemModeAsForm) ||
          addItemMode === Globals.addWithPersistentFormAndItems ||
          addItemMode === Globals.addWithPersistentFormNoItems) &&
        ValidatePerm.validateCPerm({
          user: getUser(),
          list: view[Globals.childlistFieldName],
        }) && (
          <Item
            template={`<ItemWrapperForm handlers={handlers} otherProps={otherProps}>${
              view[Globals.itemTemplateFieldName] ||
              parsedSchema.getDefaultTemplate({ hidden: true })
            }</ItemWrapperForm>`}
            listid={view[Globals.childlistFieldName][Globals.itemIdFieldName]}
            item={editingItem}
            defItem={parsedSchema.getAllDefaults({ user: getUser() })}
            unsetProps={getUnsetProperties(editingItem)}
            rowNb={0}
            setAuthAPIRequest={setAuthAPIRequest}
            checkListEditPerm={checkListEditPerm}
            handleAddItem={handleAddItem}
            handleDeleteItem={handleDeleteItem}
            showDeleteButton={false}
            setViewId={setViewId}
            addItemMode={addItemMode}
            setAddItem={setAddItem}
            backToMainView={setViewId}
            setErrorMsg={setErrorMsg}
            addLabel={
              view[Globals.itemIdFieldName] ===
              Globals.signUpViewOnUserListViewId
                ? "Register"
                : null
            }
            addMessageText={
              view[Globals.itemIdFieldName] ===
              Globals.signUpViewOnUserListViewId
                ? "Welcome to OpenTable. You have been logged in..."
                : null
            }
            addMessageTitle={
              view[Globals.itemIdFieldName] ===
              Globals.signUpViewOnUserListViewId
                ? () => `Congratulation ${getUser()} !`
                : null
            }
            recaptcha={getUser() === Globals.allUserName}
            setEditingItem={setEditingItem}
            resetEditingItem={resetEditingItem}
          />
        )}
      {view &&
        view[Globals.childlistFieldName] &&
        view[Globals.childlistFieldName][Globals.itemsFieldName] &&
        (noItemsRPerm || emptyList ? (
          <UncontrolledErrorPanel
            errorMsg={{
              severity: "warning",
              title: "Warning",
              text: noItemsRPerm
                ? Globals.noPermissionViewItems
                : Globals.noItemsInList,
            }}
            autoClose={false}
            closeButton={false}
          />
        ) : (
          view[Globals.childlistFieldName][Globals.itemsFieldName].map(
            (item) => {
              rowNb += 1;
              return (
                <Item
                  key={item[Globals.itemIdFieldName]}
                  template={
                    view[Globals.itemTemplateFieldName] ||
                    parsedSchema.getDefaultTemplate()
                  }
                  listid={
                    view[Globals.childlistFieldName][Globals.itemIdFieldName]
                  }
                  item={item}
                  defItem={parsedSchema.getAllDefaults({
                    user: getUser(),
                    listSchema: listSchemaStr,
                  })}
                  unsetProps={getUnsetProperties(item)}
                  rowNb={rowNb}
                  setAuthAPIRequest={setAuthAPIRequest}
                  checkListEditPerm={checkListEditPerm}
                  handleAddItem={handleAddItem}
                  handleDeleteItem={handleDeleteItem}
                  deleteButtonDisabled={deleteButtonDisabled(item)}
                  showDeleteButton={showDeleteButton}
                  handleEditItem={handleEditItem}
                  setUnsetPropertyButtonDisabled={setUnsetPropertyButtonDisabled(
                    item
                  )}
                  setViewId={setViewId}
                  setErrorMsg={setErrorMsg}
                />
              );
            }
          )
        ))}
    </Stack>
  );
}

export default List;
