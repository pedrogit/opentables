import React from "react";
import JsxParser from "react-jsx-parser";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import IconButton from '@mui/material/IconButton';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Tooltip from '@mui/material/Tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import * as Components from "./components";
const Globals = require("../common/globals");

// Define all components in the current scope
// so they can be used directly, without
// namespace (e.g. Components.Text), in the template
for (let name in Components) {
  global[name] = Components[name];
}

function ItemMoreMenu({
  unsetProps,
  handleSetUnsetProperty,
  setUnsetPropertyButtonDisabled
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="More Options">
        <IconButton
          id="moreItemButton"
          aria-label="more item" 
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          color="inherit"
          sx={{p: theme.openTable.buttonPadding}}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem dense
          disabled={setUnsetPropertyButtonDisabled}
        >{
          unsetProps && 
          unsetProps.length > 0 ? "Add Unset Property" + (setUnsetPropertyButtonDisabled ? " (" + Globals.permissionDenied + ")" : ""): "No Unset Property to Add"
        }</MenuItem>
        {unsetProps && unsetProps.map(prop => 
          <MenuItem
            sx={{ml: "10px"}}
            dense
            onClick={() => handleSetUnsetProperty(prop)}
            disabled={setUnsetPropertyButtonDisabled}
          >
            {prop}
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

function Item({
  template,
  listid,
  item,
  unsetProps,
  defItem,
  rowNb,
  setLoginState,
  setViewId,
  handleListAuth,
  handleAddItem,
  handleDeleteItem,
  deleteButtonDisabled,
  showDeleteButton,
  handleEditItem,
  setUnsetPropertyButtonDisabled,
  setErrorMsg,
  ...otherProps
}) {
  const [showButtons, setShowButtons] = React.useState(false);

  const theme = useTheme();

  const defaultSx = {
    bgcolor: rowNb % 2 ? "inherit" : "#EEE", 
    padding: 1,
    position: 'relative'
  };

  const buttonSx = {
    position: 'absolute',
    top: '1px',
    right: '2px'
  }

  const handleSaveProperty = (val, callback) => {
    setLoginState({
      open: false,
      msg: {
        severity: "warning",
        title: Globals.permissionDenied,
        text:
        'You do not have permissions to edit "' +
        Object.keys(val)[0] +
        '". Please login with valid credentials...',
      },
      action: {
        method: "patch",
        url: "http://localhost:3001/api/opentables/" +
             item[Globals.itemIdFieldName],
        data: val,
        callback: (success, data) => {
          if (success) {
            handleEditItem(data, Object.keys(val));
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

  const handleSetUnsetProperty = (prop) => {
    if (item[Globals.itemIdFieldName]) {
      handleSaveProperty({
        [prop]: defItem[prop]
      })
    }
    else if (otherProps.setEditingItem) {
      otherProps.setEditingItem({
        ...item,
        [prop]: defItem[prop]
      });
    }
  }

  const handleItemAuth = ({action = 'patch', propName, callback}) => {
    handleListAuth({
      action: 'patch', 
      item: item, 
      propName: propName, 
      callback: callback
    });
  }

  const setBindings = (item) => {
    // add property name and rest handlers
    var result = {};
    for (var key in item) {
      if (item.hasOwnProperty(key) && key !== Globals.childlistFieldName) {
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

  return (
    <Box 
      id={"item_" + (item ? item[Globals.itemIdFieldName] : '')}
      sx={defaultSx}
      onMouseEnter={() => setShowButtons(true)}
      onMouseLeave={() => setShowButtons(false)}
    >
      <JsxParser
        bindings={setBindings(item)}
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
        <Stack sx={buttonSx} direction="row">
          {showDeleteButton &&
            <Tooltip title={"Delete Item" + (deleteButtonDisabled ? " (" + Globals.permissionDenied + ")" : "")}>
              <span>
              <IconButton
                id="deleteItemButton"
                aria-label="delete item" 
                color="inherit"
                sx={{p: theme.openTable.buttonPadding}}
                onClick={() => handleDeleteItem(item[Globals.itemIdFieldName])}
                disabled={deleteButtonDisabled}
              >
                <HighlightOffIcon />
              </IconButton>
              </span>
            </Tooltip>
          }
          <ItemMoreMenu
            unsetProps={unsetProps}
            handleSetUnsetProperty={handleSetUnsetProperty}
            setUnsetPropertyButtonDisabled={setUnsetPropertyButtonDisabled}
          />
        </Stack>
      }
    </Box>
  );
}

export default Item;
