import React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import Input from '@mui/material/Input';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { useTheme } from "@mui/material/styles";

import VisibilityPasswordTextField from "./VisibilityPasswordTextField";

const Globals = require("../common/globals");

/********************
 *  Label component
 ********************/
function Label({val, vertical, nolabel, sx}) {
  const theme = useTheme();
  var fontSize = vertical
    ? theme.typography.caption
    : theme.typography.body1;

  var defaultSx = {
    fontSize: fontSize,
    color: theme.palette.primary.main,
    fontWeight: "bold",
    marginRight: 1,
  };

  if (!nolabel) {
    var separator = vertical ? null : <>&nbsp;:</>;
    return (
      <Typography sx={{ ...defaultSx, ...sx }}>
        {val}
        {separator}
      </Typography>
    );
  }

  return null;
}

/********************
 *  Text component
 ********************/
function Text({
  val, 
  inline = false,
  inform = false,
  pretty = false,
  editmode = false,
  noeditdefault = false,
  reset = false,
  disableReset,
  vertical = false,
  label, 
  nolabel = false,
  labelSx = {}, 
  sx
}) {
  const propName = val ? (val.prop ? val.prop : "Missing property name") : undefined;
  const propVal = val ? (val.val ? val.val : "Missing value") : undefined;
  const defVal = val ? (val.def ? val.def : "Missing default value") : undefined;

  const valueRef = React.useRef();
  const theme = useTheme();

  const [editVal, setEditVal] = React.useState(noeditdefault && propVal === defVal ? "" : propVal);
  const [isEditing, setIsEditing] = React.useState(editmode);

  React.useEffect(() => {
    if (reset) {
      setEditVal(defVal);
      disableReset();
    }
  }, [reset, defVal, setEditVal, disableReset] );

  if (val && (propName || editVal)) {

    var defaultSx = {
      marginTop: inline && pretty && (editmode || isEditing) ? "8px" : "inherit",
      marginBottom: inline && pretty && (editmode || isEditing) ? "8px" : "inherit"
    };

    const handleEdit = (e) => {
      if (!inform) {
        val.handleItemAuth({
          action: 'patch', 
          propName: val.prop, 
          callback: (auth) => {
            setIsEditing(true);
          }
        });
      }
    };

    const handleChange = (val) => {
      setEditVal(val);
    };

    const handleSave = () => {
      if (!inform) {
        val.handleSaveProperty({ [propName]: editVal }, (success, val) => {
          setIsEditingOff();
        });
      }
    };

    const keyPressed = (e) => {
      if (!inform) {
        if (e.keyCode === 13) { // enter
          handleSave();
        }
      }
      if (e.keyCode === 27) { // escape
        setEditVal(propVal);
        setIsEditingOff()
      }
    };

    const setIsEditingOff = () => {
      if (!inform) {
        setIsEditing(false);
      }
    }

    const inputLabel = 'Edit "' + propName + '"...';
    const getWidth = () => {
      const labelFontWidth = 0.75 * theme.typography.fontSize * 0.4;
      const labelW = labelFontWidth * inputLabel.length;
      const inputPadding = 28;
      const popoverPadding = 16;
      return Math.max(
        (valueRef && valueRef.current && valueRef.current.offsetWidth ? valueRef.current.offsetWidth : 0) + inputPadding + popoverPadding,
        labelW + 2 * labelFontWidth + inputPadding + popoverPadding
      );
    };

    return (
      <>
        <Stack direction={vertical ? "column" : "row"}>
          {(!(inline && pretty) || !(editmode || isEditing)) && <Label 
            vertical={vertical} 
            val={label ? label : propName.charAt(0).toUpperCase() + propName.slice(1)}
            nolabel={nolabel} 
            sx={labelSx}
          />}
          {(editmode || isEditing) && inline ? (
            <>
            <ClickAwayListener onClickAway={setIsEditingOff}>
              <TextField
                name={propName}
                variant={pretty ? "outlined" : "filled"}
                sx={{ ...defaultSx, ...sx, backgroundColor: theme.palette.primary.palebg}}
                inputProps={pretty? {} : {
                  style: {padding: '0px'}
                }}
                size="small"
                label={pretty ? (label ? label : propName.charAt(0).toUpperCase() + propName.slice(1)) : null}
                fullWidth
                value={editVal}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={(e) => keyPressed(e)}
                InputLabelProps={{shrink: true}}
                autoFocus={inform ? false : true}
              />
            </ClickAwayListener>
            </>
          ) : (
            <Typography
              sx={{ ...defaultSx, ...sx }}
              onDoubleClick={handleEdit}
              ref={valueRef}
            >
              {propVal}
            </Typography>
          )}
        </Stack>
        <Popover
          open={(editmode || isEditing) && !inline}
          anchorEl={valueRef.current}
          onClose={setIsEditingOff}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Box sx={{ p: 1, width: getWidth() }}>
            <TextField
              sx={{backgroundColor: theme.palette.primary.palebg}}
              fullWidth
              id="outlined-basic"
              variant="outlined"
              size="small"
              label={inputLabel}
              value={editVal}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={(e) => keyPressed(e)}
              autoFocus
            />
          </Box>
        </Popover>
      </>
    );
  }
  return (<Typography color = 'red'>&lt;Text value is missing /&gt;</Typography>);
}

/*************************
 *  Viewlink component
 *************************/
function Viewlink({
  text,  //text to display under the link
  viewid //viewid of the view to display
}) {
  return (
    <Link onClick={() => (viewid.setViewId)(viewid.val)}>
      {text ? (text.val ? text.val : "Text property missing...") : "Text property missing..."}
    </Link>
  )
}

/*************************
 *  Password component
 *  
 *  Always in edit mode
 *************************/
function Password({
  val,
  inline = false,
  pretty = false,
  vertical = false,
  reset = false,
  disableReset,
  label, 
  nolabel = false,
  labelSx = {}, 
  sx
}) {
  const propName = val ? (val.prop ? val.prop : "Missing property name") : undefined;
  const propVal = val ? (val.val ? val.val : "Missing value") : undefined;
  const defVal = val ? (val.def ? val.def : "Missing default value") : undefined;

  const [editVal, setEditVal] = React.useState(propVal === defVal ? "" : propVal);
  const theme = useTheme();

  var defaultSx = {
    marginTop: inline && pretty ? "8px" : "inherit",
    marginBottom: inline && pretty ? "8px" : "inherit"
  };

  const handleChange = (val) => {
    setEditVal(val);
  };

  return (
    <>
      <Stack direction={vertical ? "column" : "row"}>
        {!pretty && <Label 
            vertical={vertical} 
            val={label ? label : propName.charAt(0).toUpperCase() + propName.slice(1)}
            nolabel={nolabel} 
            sx={labelSx}
          />
        }
        
        <VisibilityPasswordTextField
          name={propName}
          value={editVal}
          sx={{ ...defaultSx, ...sx, backgroundColor: theme.palette.primary.palebg}}
          inputProps={pretty? {} : {
            style: {padding: "0px"}
          }}
          variant={inline && !pretty ? "filled" : "outlined"}
          size="small"
          fullWidth
          label={inline && !pretty ? null : (label ? label : propName.charAt(0).toUpperCase() + propName.slice(1))}
          autoComplete="off"
          onChange={(e) => handleChange(e.target.value)}
          InputLabelProps={{shrink: true}}
        />
      </Stack>
    </>
  )
}

function ItemWrapperForm({handlers, otherProps, children}) {
  const defChildProps = {
    inform: true, 
    inline: true, 
    pretty: true, 
    editmode: true,
    noeditdefault: true
  }
  const [childProps, setChildProps] = React.useState(defChildProps);

  var options = {
    cancelLabel: "Cancel",
    cancelAction: () => otherProps.setAddItem(false),
    addLabel: "Add",
    addAction: () => otherProps.setAddItem(false)
  };

  if (otherProps.addItemMode === Globals.addItemModeAtLoadWithoutItems) {
    options = {
      ...options,
      cancelAction: () => otherProps.backToMainView(Globals.viewOnAllViewViewId),
      addLabel: otherProps.addLabel ? otherProps.addLabel : "Save",
      addAction: () => otherProps.backToMainView(Globals.viewOnAllViewViewId),
      addMessage: {
        severity:"success",
        title: "Success!",
        text: "Your new item was added..."
      }
    }
    if (otherProps && otherProps.addMessageText) {
      options.addMessage.text = otherProps.addMessageText;
    }
    if (otherProps && otherProps.addMessageTitle) {
      options.addMessage.title = otherProps.addMessageTitle;
    }
  }

  const disableReset = () => {
    setChildProps(defChildProps)
  }

  const resetForm = () => {
    setChildProps({
      ...defChildProps, 
      reset: true, 
      disableReset: disableReset});
  }
  
  if (otherProps.addItemMode === Globals.addItemModeAtLoadWithItems) {
    options = {
      cancelLabel: "Reset",
      cancelAction: () => resetForm(),
      addLabel: "Add",
      addAction: () => resetForm()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    var newItem = {};
    for (var i = 0; i < e.target.length - 1; i++) {
      if (e.target[i].type !== "button") {
        newItem[e.target[i].name] = e.target[i].defaultValue;
      }
    }
    handlers.handleAddItem({
      item: newItem,
      addToLocalList: otherProps.addItemMode === Globals.addItemModeAtLoadWithoutItems ? false : true,
      callback: (success) => {
        if (success) {
          if (options.addMessage) {
            handlers.setErrorMsg(options.addMessage);
          }
          options.addAction();
        }
      }
    })
  }

  const childrenWithProp = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, childProps);  
    }
    return child;
  });

  const keyPressed = (e) => {
    if (e.keyCode === 27) {
      options.cancelAction();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={keyPressed}
    >
      {childrenWithProp}
      <Stack direction="row" justifyContent="flex-end">
        <ButtonGroup variant="contained" size="small">
          <Button id="editCancelButton" onClick={() => options.cancelAction()}>{options.cancelLabel}</Button>
          <Button id="editButton" type="submit">{options.addLabel}</Button>
        </ButtonGroup>
      </Stack>
    </form>
  )
}

function allComponentsAsJson() {
  return { Text, Label, Viewlink, Password, ItemWrapperForm };
}

export { allComponentsAsJson };
