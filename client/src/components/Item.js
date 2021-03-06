import React from "react";
import JsxParser from "react-jsx-parser";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Tooltip from "@mui/material/Tooltip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import * as Components from "./components";

const Globals = require("../../../common/globals");

// Define all components in the current scope
// so they can be used directly, without
// namespace (e.g. Components.Text), in the template
Object.keys(Components).forEach((name) => {
  global[name] = Components[name];
});

function ItemMoreMenu({
  unsetProps,
  handleSetUnsetProperty,
  setUnsetPropertyButtonDisabled,
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
          id="moreOptionsButton"
          aria-label="more item"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          color="inherit"
          sx={{ p: theme.openTable.buttonPadding }}
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
          "aria-labelledby": "basic-button",
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem dense disabled={setUnsetPropertyButtonDisabled}>
          {unsetProps && unsetProps.length > 0
            ? Globals.addOptionalPropertyMenu +
              (setUnsetPropertyButtonDisabled
                ? ` (${Globals.permissionDenied})`
                : "")
            : Globals.noOptionalPropertyToAddMenu}
        </MenuItem>
        {unsetProps &&
          unsetProps.map((prop) => (
            <MenuItem
              sx={{ ml: "10px" }}
              dense
              onClick={() => handleSetUnsetProperty(prop)}
              disabled={setUnsetPropertyButtonDisabled}
            >
              {prop}
            </MenuItem>
          ))}
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
  setAuthAPIRequest,
  setViewId,
  checkListEditPerm,
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
    position: "relative",
  };

  const buttonSx = {
    position: "absolute",
    top: "1px",
    right: "2px",
  };

  const handleSaveProperty = (val, callback) => {
    if (item[Globals.itemIdFieldName]) {
      setAuthAPIRequest({
        method: "patch",
        tryBeforeShowLogin: true,
        warningMsg: `edit "${Object.keys(val)[0]}"`,
        urlParams: item[Globals.itemIdFieldName],
        data: val,
        callback: (success, data) => {
          if (success) {
            handleEditItem(data, Object.keys(val));
          }
          if (callback && typeof callback === "function") {
            callback(success, data);
          }
        },
      });
    } else if (otherProps.setEditingItem) {
      otherProps.setEditingItem({
        ...item,
        ...val,
      });
    }
    return false;
  };

  const handleSetUnsetProperty = (prop) => {
    if (item[Globals.itemIdFieldName]) {
      handleSaveProperty({
        [prop]: defItem[prop],
      });
    } else if (otherProps.setEditingItem) {
      otherProps.setEditingItem({
        ...item,
        [prop]: defItem[prop],
      });
    }
  };

  const checkItemEditPerm = (propName) => {
    if (checkListEditPerm(item)) {
      return true;
    }
    setErrorMsg({
      severity: "info",
      title: Globals.permissionDenied,
      text: `You do not have permission to edit "${propName}". Please login with valid credentials...`,
    });
    return false;
  };

  const setBindings = (bindItem) => {
    // add property name and rest handlers
    const result = {};
    Object.keys(bindItem).forEach((key) => {
      if (
        Object.prototype.hasOwnProperty.call(bindItem, key) &&
        key !== Globals.childlistFieldName
      ) {
        result[key] = {
          handleSaveProperty,
          checkItemEditPerm,
          setViewId,
          prop: key,
          val: bindItem[key] ? bindItem[key] : "",
          def: defItem && defItem[key] ? defItem[key] : key,
        };
      }
    });
    result.handlers = {
      handleAddItem,
      handleSaveProperty,
      checkListEditPerm,
      setErrorMsg,
    };
    if (otherProps) {
      result.otherProps = otherProps;
    }
    return result;
  };

  return (
    <Box
      id={`item_${item ? item[Globals.itemIdFieldName] : ""}`}
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
        disableKeyGeneration // prevent provided jsx to be reconstructed at every render and to keep their states
        allowUnknownElements={false}
        renderUnrecognized={(tagName) => (
          <span style={{ color: theme.palette.primary.main }}>
            Error: unrecognized tag ({tagName})...
          </span>
        )}
      />
      {showButtons && (
        <Stack sx={buttonSx} direction="row">
          {showDeleteButton && (
            <Tooltip
              title={`Delete Item${
                deleteButtonDisabled ? ` (${Globals.permissionDenied})` : ""
              }`}
            >
              <span>
                <IconButton
                  id="deleteItemButton"
                  aria-label="delete item"
                  color="inherit"
                  sx={{ p: theme.openTable.buttonPadding }}
                  onClick={() =>
                    handleDeleteItem(item[Globals.itemIdFieldName])
                  }
                  disabled={deleteButtonDisabled}
                >
                  <HighlightOffIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <ItemMoreMenu
            unsetProps={unsetProps}
            handleSetUnsetProperty={handleSetUnsetProperty}
            setUnsetPropertyButtonDisabled={setUnsetPropertyButtonDisabled}
          />
        </Stack>
      )}
    </Box>
  );
}

export default Item;
