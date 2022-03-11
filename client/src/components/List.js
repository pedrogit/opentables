import React from "react";
import Item from "./Item";
import Stack from "@mui/material/Stack";

import getUser from "../clientUtils";
const Schema = require("../common/schema");
const Utils = require("../common/utils");
const Globals = require("../common/globals");

// a list receive a view, list and a list of items
function List({ 
  listType,
  view,
  list,
  items,
  setItemsData,
  setLoginState,
  setViewId,
  handleAddItem,
  handleDeleteItem,
  sx
}) {
  var localTemplate = view.item_template;
  if (list) {
    var parsedSchema = new Schema(list[Globals.listSchemaFieldName]);
    if (localTemplate === "") {
      /*localTemplate = '<Box sx={{borderRadius:5, border:1, padding:2}}>' + parsedSchema.getRequired().map(prop => 
        '<Text val={' + prop + '} /> '
      ).join('') + '</Box>';*/
      localTemplate = parsedSchema
        .getRequired(true)
        .map((prop) => {
          //return ("<Text key={key + '_" + prop + "'} val={" + prop + "}/> ")
          return ("<Text val={" + prop + "}/> ")
        })
        //.map((prop) => "<Text /> ")
        .join("");
    }
  }

  if (items && !(items instanceof Array)) {
    items = [items];
  }

  var rowNb = 0;

  var handleListAuth = function({action = 'patch', item = null, propName = '', callback}) {
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

  return (
    <Stack sx={sx}>
      {items && items.map((item) => {
        rowNb = rowNb + 1;
        return (
          <Item
            key={item._id}
            template={localTemplate}
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
