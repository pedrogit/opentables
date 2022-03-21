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
  list,
  setLoginState,
  setViewId,
  setListData,
  setAddItem,
  addItem,
  setErrorMsg,
  sx
}) {
  const handleAddItem = React.useCallback(
    (item, callback) => {
      if (list) {
        setLoginState({
          open: false,
          msg: {
            severity: "warning",
            title: "Permission denied",
            text: 'You do not have permissions to add items to this list. Please login with valid credentials...'
          },
          action: {
            method: "post",
            url: "http://localhost:3001/api/opentables/" + list[Globals.itemIdFieldName],
            data: item,
            callback: (success, newitem) => {
              if (success) {
                var newItemsData = list.items;
                if (!newItemsData) {
                  newItemsData = [];
                }
                newItemsData.unshift(newitem);
                setListData({
                  ...list,
                  items: newItemsData
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
    }, [list, setLoginState, setListData, setErrorMsg]
  );

  React.useEffect(() => {
    if (addItem) {
      setAddItem(false);
      handleAddItem();
    }
  }, [addItem, setAddItem, handleAddItem] );

    var template;
    var parsedSchema;
    if (list && view) {
      // parse the schema and generate a default template if necesssary (should be done in the schema validator)
      parsedSchema = new Schema(list[Globals.listSchemaFieldName]);
      template = view.item_template;

      if (template === "") {
        /*template = '<Box sx={{borderRadius:5, border:1, padding:2}}>' + parsedSchema.getRequired().map(prop => 
          '<Text val={' + prop + '} /> '
        ).join('') + '</Box>';*/
        template = parsedSchema
          .getRequired(true)
          .map((prop) => {
            //return ("<Text key={key + '_" + prop + "'} val={" + prop + "}/> ")
            return ("<Text val={" + prop + "}/> ")
          })
          //.map((prop) => "<Text /> ")
          .join("");
      }
    }
    else {
      template = null;
    }

    var addTemplate;
    if (view && view[Globals.addItemModeFieldName] && (
        view[Globals.addItemModeFieldName] === Globals[Globals.addItemModeAtLoadWithItems] || 
        view[Globals.addItemModeFieldName] === Globals[Globals.addItemModeAtLoadWithoutItems]
    )) {
      addTemplate = "<Form handlers={handlers}>" + template + "</Form>"
      setAddItem(true);
    }

  var rowNb = 0;

  const handleListAuth = function({action = 'patch', item = null, propName = '', callback}) {
    var auth = false;
    if (action === "patch") {
      auth = Utils.validateRWPerm({
        user: getUser(),
        list: list,
        item: item,
        throwError: false
      });
    }
    else if (action === "post") {
      auth = Utils.validateCPerm({
        user: getUser(),
        list: list,
        throwError: false
      });
    }
    
    if (!auth) {
      // open login dialog
      setLoginState({
        open: true, 
        msg: {
          severity: "warning",
          title: "Permission denied",
          text:
          'You do not have permissions to edit ' + 
          (propName ? ('"' + propName + '"') : "item") +
          '. Please login with valid credentials...',
  
        },
        action: {
          method: "get",
          url: "http://localhost:3001/api/opentables/login",
          callback: (success) => callback(success)
        },
        tryFirst: false
      });

    }
    else {
      if (callback && typeof callback === 'function') {
        callback(true);
      }
    }
    return auth;
  }

  const handleDeleteItem = React.useCallback(
    (itemid, callback) => {
      if (list) {
        setLoginState({
          open: false,
          msg: {
            severity: "warning",
            title: "Permission denied",
            text:
            'You do not have permissions to delete items from this list. Please login with valid credentials...',
          },
          action: {
            method: "delete",
            url: "http://localhost:3001/api/opentables/" + itemid,
            callback: (success, data) => {
              if (success) {
                var newItemsData = [...list.items];
                newItemsData = newItemsData.filter(item => item[Globals.itemIdFieldName] !== itemid);
                setListData({
                  ...list,
                  items: newItemsData
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
    }, [list, setLoginState, setListData, setErrorMsg]
  );

  return (
    <Stack sx={sx}>
      {addItem && addTemplate && 
        <Item
          //key={item._id}
          template={addTemplate}
          listid={list._listid}
          item={parsedSchema.getAllDefault(true, getUser())}
          rowNb={0}
          setLoginState={setLoginState}
          handleListAuth={handleListAuth}
          handleAddItem={handleAddItem}
          handleDeleteItem={handleDeleteItem}
          setViewId={setViewId}
      />}
      {template && list && list.items && list.items.map((item) => {
        rowNb = rowNb + 1;
        return (
          <Item
            key={item._id}
            template={template}
            listid={list._listid}
            item={item}
            rowNb={rowNb}
            setLoginState={setLoginState}
            handleListAuth={handleListAuth}
            handleAddItem={handleAddItem}
            handleDeleteItem={handleDeleteItem}
            setViewId={setViewId}
          />
        );
      })}
    </Stack>
  );
}

export default List;
