import React from "react";
//import React, {memo} from "react";
import JsxParser from "react-jsx-parser";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import IconButton from '@mui/material/IconButton';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import * as Components from "./components";
const Globals = require("../common/globals");

// Define all components in the current scope
// so they can be used directly, without
// namespace (e.g. Components.Text), in the template
for (let name in Components) {
  global[name] = Components[name];
}

function Item({ 
  template, 
  item, 
  rowNb, 
  setLoginState, 
  handleListAuth, 
  handleDeleteItem,
  setViewId
}) {
  const [newItem, setItem] = React.useState(item);
  const [showButtons, setShowButtons] = React.useState(false);

  const theme = useTheme();

  var defaultSx = {
    bgcolor: rowNb % 2 ? "inherit" : "#EEE", 
    padding: 1,
    position: 'relative'
  };

  var buttonSx = {
    position: 'absolute',
    top: '1px',
    right: '1px'
  }

  var handlePatch = function (val, callback) {
    setLoginState({
      open: false,
      msg: {
        severity: "warning",
        title: "Permission denied",
        text:
        'You do not have permissions to edit "' +
        Object.keys(val)[0] +
        '". Please login with valid credentials...',
      },
      action: {
        method: "patch",
        url: "http://localhost:3001/api/opentables/" + newItem[Globals.itemIdFieldName],
        data: val,
        callback: (success, data) => {
          if (success) {
            setItem(data);
            callback(success, data[Object.keys(val)[0]]);
          }
        }
      },
      tryFirst: true
    });
    return false;
  };

  var handleItemAuth = function(action = 'patch', propName, callback) {
    handleListAuth(action = 'patch', item, propName, callback);
  }

  var setBindings = function (item) {
    //console.log('Item setBindings()...');

    // add property name and rest handlers
    var result = {};
    for (var key in item) {
      if (item.hasOwnProperty(key)) {
        result[key] = {
          handlePatch: handlePatch,
          handleItemAuth: handleItemAuth,
          setViewId: setViewId,
          prop: key,
          val: item[key] ? item[key] : "",
        };
      }
    }
    //result.key = result._id.val;
    return result;
  };



  //console.log('Render Item (' +  item.name + ')...');

  return (
    <Box 
      id={"item_" + (newItem ? newItem[Globals.itemIdFieldName] : '')}
      sx={defaultSx}
      onMouseEnter={() => setShowButtons(true)}
      onMouseLeave={() => setShowButtons(false)}
    >
      <JsxParser
        bindings={setBindings(newItem)}
        components={{ ...Components.allComponentsAsJson(), Box, Stack }}
        jsx={template}
        renderInWrapper={false}
        onError={() => {}}
        renderError={({ error }) => <span>{error}</span>}
        showWarnings={false}
        disableKeyGeneration={true} // prevent provided jsx to be reconstructed at every render and to keep their states
        allowUnknownElements={false}
        renderUnrecognized={(tagName) => (
          <span style={{ color: theme.palette.primary.main }}>
            Error: unrecognized tag ({tagName})...
          </span>
        )}
      />
      {showButtons && 
        <Stack sx={buttonSx}>
          <IconButton
            id="deleteItemButton"
            aria-label="delete item" 
            color="inherit"
            onClick={() => handleDeleteItem(newItem[Globals.itemIdFieldName])}
          >
            <HighlightOffIcon />
          </IconButton>
        </Stack>
      }
    </Box>
  );
}

//export default memo(Item);
export default Item;
