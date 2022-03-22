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
  editmode = false,
  vertical = false,
  label, 
  nolabel = false,
  labelSx = {}, 
  sx
}) {
  const propName = val ? (val.prop ? val.prop : "Missing property name") : undefined;
  const propVal = val ? (val.val ? val.val : "Missing value") : undefined

  const valueRef = React.useRef();
  const theme = useTheme();

  const [editVal, setEditVal] = React.useState(propVal);
  const [isEditing, setIsEditing] = React.useState(editmode);

  if (val && (propName || editVal)) {

    var defaultSx = {};

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
          <Label 
            vertical={vertical} 
            val={label ? label : propName.charAt(0).toUpperCase() + propName.slice(1)}
            nolabel={nolabel} 
            sx={labelSx}
          />
          {(editmode || isEditing) && inline ? (
            <>
            <ClickAwayListener onClickAway={setIsEditingOff}>
              <Input
                name={propName}
                sx={{ ...defaultSx, ...sx, backgroundColor: theme.palette.primary.palebg}}
                inputProps={{
                  style: { padding: '0px' }
                }}
                fullWidth
                value={editVal}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={(e) => keyPressed(e)}
                autoFocus
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

function Listlink({text, listid}) {
  return (
    <Link onClick={() => (listid.setViewId)(listid.val)}>{text ? (text.val ? text.val : "No text property...") : "No text property..."}</Link>
  )
}

function ItemWrapperForm({handlers, otherProps, children}) {
  var options = {
    cancelLabel: "Cancel",
    cancelAction: () => otherProps.setAddItem(false),
    okLabel: "Add",
    addAction: () => otherProps.setAddItem(false)
  };

  if (otherProps.addItemMode === Globals.addItemModeAtLoadWithoutItems) {
    options = {
      ...options,
      cancelAction: () => otherProps.backToMainView(Globals.viewOnAllViewViewId),
      addAction: () => otherProps.backToMainView(Globals.viewOnAllViewViewId),
      addMessage: {
        text: "Welcome to OpenTable. You have been logged in..."
      }
    }
  }

  const resetForm = () => {
    alert('Reset form');
  }
  
  if (otherProps.addItemMode === Globals.addItemModeAtLoadWithItems) {
    options = {
      cancelLabel: "Reset",
      cancelAction: resetForm,
      okLabel: "Add",
      addAction: resetForm
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
      callback: () => {
        if (options.addMessage) {
          handlers.setErrorMsg(options.addMessage);
        }
        options.addAction();
      }
    })
  }

  const childrenWithProp = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {inform: true, inline: true, editmode: true});  
    }
    return child;
  });

  const keyPressed = (e) => {
    if (e.keyCode === 27) {
      options.cancelAction();
    }
  };

  const handleCancel = (e) => {

    options.cancelAction();
  }

  return (
      <form 
        onSubmit={handleSubmit}
        onKeyDown={(e) => keyPressed(e)}
      >
        {childrenWithProp}
        <Stack direction="row" justifyContent="flex-end">
          <ButtonGroup variant="contained" size="small">
            <Button id="editCancelButton" onClick={handleCancel}>{options.cancelLabel}</Button>
            <Button id="editButton" type="submit">{options.okLabel}</Button>
          </ButtonGroup>
        </Stack>
      </form>
  )
}

function allComponentsAsJson() {
  return { Text, Label, Listlink, ItemWrapperForm };
}

export { allComponentsAsJson };
