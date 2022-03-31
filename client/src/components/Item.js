import React from "react";
//import React, {memo} from "react";
import JsxParser from "react-jsx-parser";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import IconButton from '@mui/material/IconButton';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Tooltip from '@mui/material/Tooltip';

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
  listid,
  item,
  defItem,
  rowNb,
  setLoginState,
  setViewId,
  handleListAuth,
  handleAddItem,
  handleDeleteItem,
  setErrorMsg,
  ...otherProps
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

  var handleSaveProperty = function (val, callback) {
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
        url: "http://localhost:3001/api/opentables/" + 
             newItem[Globals.itemIdFieldName],
        data: val,
        callback: (success, data) => {
          if (success) {
            setItem(data);
          }
          if (callback && typeof callback === 'function') {
            callback(success, data);
          }
        }
      },
      tryFirst: true
    });
    return false;
  };

  var handleItemAuth = function({action = 'patch', propName, callback}) {
    handleListAuth({
      action: 'patch', 
      item: item, 
      propName: propName, 
      callback: callback
    });
  }

  var setBindings = function (item) {
    // add property name and rest handlers
    var result = {};
    for (var key in item) {
      if (item.hasOwnProperty(key)) {
        result[key] = {
          handleSaveProperty: handleSaveProperty,
          handleItemAuth: handleItemAuth,
          setViewId: setViewId,
          prop: key,
          val: item[key] ? item[key] : "",
          def: defItem && defItem[key] ? defItem[key] : key
        };
      }
    }
    result.handlers = {
      handleAddItem: handleAddItem,
      handleSaveProperty: handleSaveProperty,
      handleListAuth: handleListAuth,
      setErrorMsg: setErrorMsg
    };
    if (otherProps) {
      result.otherProps = otherProps;
    }
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
          <Tooltip title="Delete Item">
            <IconButton
              id="deleteItemButton"
              aria-label="delete item" 
              color="inherit"
              onClick={() => handleDeleteItem(newItem[Globals.itemIdFieldName])}
            >
              <HighlightOffIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    </Box>
  );
}

export default Item;
