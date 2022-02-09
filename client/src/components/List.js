import React from "react";
import Item from "./Item";
import Stack from "@mui/material/Stack";

import getUser from "../clientUtils";
const Schema = require("../common/schema");
const Utils = require("../common/utils");
const Globals = require("../common/globals");

// a list receive a view, list and a list of items
function List({ 
  type, 
  view, 
  list, 
  items, 
  setLoginState, 
  handleDeleteItem, 
  setViewId, 
  sx
}) {
  var parsedSchema = new Schema(list[Globals.listSchemaFieldName]);
  if (!(items instanceof Array)) {
    items = [items];
  }

  var localTemplate = view.item_template;
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

  var rowNb = 0;

  var handleAuth = function(action = 'patch', propName, callback) {
    var auth = Utils.validatePerm(
      getUser(),
      list[Globals.ownerFieldName],
      null,
      list[Globals.itemReadWritePermFieldName],
      null,
      false
    );
    if (!auth) {
      // open login dialog
      setLoginState({
        open: true, 
        msg: {
          severity: "warning",
          title: "Permission denied",
          text:
          'You do not have permissions to edit "' +
          propName +
          '". Please login with valid credentials...',
  
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
      callback(true);
    }
    return auth;
  }

  console.log('Render List (' + type + ')...');
  return (
    <Stack sx={sx}>
      {items.map((item) => {
        rowNb = rowNb + 1;
        return (
          <Item
            key={item._id}
            template={localTemplate}
            item={item}
            rowNb={rowNb}
            setLoginState={setLoginState}
            handleAuth={handleAuth}
            handleDeleteItem={handleDeleteItem}
            setViewId={setViewId}
          />
        );
      })}
    </Stack>
  );
}

export default List;
