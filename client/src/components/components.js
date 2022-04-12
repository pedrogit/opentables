import React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import MUISelect from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { useTheme } from "@mui/material/styles";
import ReCAPTCHA from "react-google-recaptcha";

import VisibilityPasswordTextField from "./VisibilityPasswordTextField";

const Globals = require("../common/globals");
const Errors = require("../common/errors");

/********************
 *  Label component
 ********************/
function Label({
  val, // label text
  vertical = false, // label is over the component (vertical=true), or  on the left size of it (vertical=false)
  nolabel = false, // do not dispay the label
  sx // label sx
}) {
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
  inline = false, // edit mode is inline 
  inform = false, // component is part of a form
  pretty = false, // make inline inputs pretty
  editmode = false, // switch between read and edit mode
  noeditdefault = false, // set to empty when resetting
  reset = false, // reset or not
  disableReset, // function to reset the reset mode
  vertical = false, // vertical lavels (horizontal otherwise)
  label, // label
  nolabel = false, // do not display label
  labelSx = {}, // label sx
  sx  // component sx
}) {
  const propName = val ? (val.prop === undefined ? "Missing property name" : val.prop) : undefined;
  const propVal = val ? (val.val === undefined ? "Missing value" : val.val) : undefined;
  const defVal = val ? (val.def === undefined ? "Missing default value" : val.def) : undefined;

  const valueRef = React.useRef();
  const theme = useTheme();

  const [editVal, setEditVal] = React.useState(noeditdefault ? "" : propVal);
  const [isEditing, setIsEditing] = React.useState(editmode);

  React.useEffect(() => {
    if (reset) {
      setEditVal(noeditdefault ? "" : defVal);
      disableReset();
    }
  }, [reset, noeditdefault, defVal, setEditVal, disableReset] );

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
            if (!editVal) {
              setEditVal(propVal);
            }
            setIsEditing(true);
          }
        });
      }
    };

    const handleChange = (val) => {
      setEditVal(val);
    };

    const handleSave = () => {
      if (!inform && editVal !== propVal) {
        val.handleSaveProperty({ [propName]: editVal }, (success, val) => {
          if (success) {
            setIsEditingOff();
            setEditVal(val[propName]);
          }
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
        if (!editVal) {
          setEditVal(propVal);
        }
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
  return null;
}

/********************
 *  Select component
 ********************/
 function Select({
  val,
  options,
  inform = false, // component is part of a form
  pretty = false, // make inline inputs pretty
  editmode = false, // init in edit mode
  reset = false, // reset or not
  disableReset, // function to reset the reset mode
  vertical = false, // vertical lavels (horizontal otherwise)
  label, // label
  nolabel = false, // do not display label
  labelSx = {}, // label sx
  sx  // component sx
}) {
  const propName = val ? (val.prop === undefined ? "Missing property name" : val.prop) : undefined;
  const propVal = val ? (val.val === undefined ? "Missing value" : val.val) : undefined;
  const defVal = val ? (val.def === undefined ? "Missing default value" : val.def) : undefined;

  const valueRef = React.useRef();
  const theme = useTheme();

  const [editVal, setEditVal] = React.useState(propVal);
  const [isEditing, setIsEditing] = React.useState(editmode);

  React.useEffect(() => {
    if (reset) {
      setEditVal(defVal);
      disableReset();
    }
  }, [reset, defVal, setEditVal, disableReset] );

  if (val && (propName || editVal)) {

    var defaultSx = {
      marginTop: inform && pretty && (editmode || isEditing) ? "8px" : "inherit",
      marginBottom: inform && pretty && (editmode || isEditing) ? "8px" : "inherit"
    };

    const handleEdit = (e) => {
      if (!inform) {
        val.handleItemAuth({
          action: 'patch', 
          propName: val.prop, 
          callback: (auth) => {
            if (!editVal) {
              setEditVal(propVal);
            }
            setIsEditing(true);
          }
        });
      }
    };

    const handleChange = (newVal) => {
      if (!inform && newVal !== propVal) {
        val.handleSaveProperty({ [propName]: newVal }, (success, data) => {
          if (success) {
            setIsEditingOff();
            setEditVal(data[propName]);
          }
        });
      }
    };

    const keyPressed = (e) => {
      if (e.keyCode === 27) { // escape
        setEditVal(propVal);
        setIsEditingOff()
      }
    };

    const setIsEditingOff = () => {
      if (!inform) {
        setIsEditing(false);
        if (!editVal) {
          setEditVal(propVal);
        }
      }
    }

    return (
      <Stack direction={vertical ? "column" : "row"}>
        {(!(inform && pretty) || !(editmode || isEditing)) && <Label 
          vertical={vertical} 
          val={label ? label : propName.charAt(0).toUpperCase() + propName.slice(1)}
          nolabel={nolabel} 
          sx={labelSx}
        />}
        {(editmode || isEditing) ? (
          <>
            <MUISelect
              name={propName}
              open={editmode || isEditing}
              variant={"standard"}
              sx={{ ...defaultSx, ...sx, backgroundColor: theme.palette.primary.palebg}}

              SelectDisplayProps={{style: {padding:'0px 20px 0px 0px '}}}
              size="small"
              autoWidth={true}
              value={editVal}
              onChange={(e) => {handleChange(e.target.value)}}
              onKeyDown={(e) => keyPressed(e)}
              onClose={setIsEditingOff}
            >
              <MenuItem value=""><em>Reset</em></MenuItem>
              {options && options.map(opt => <MenuItem value={opt}>{opt}</MenuItem>)}
            </MUISelect>
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
    );
  }
  return null;
}

/*************************
 *  Viewlink component
 *************************/
function Viewlink({
  text,  // text to display under the link
  viewid // viewid of the view to display
}) {
  return (
    <Link onClick={viewid && viewid.setViewId ? (() => (viewid.setViewId)(viewid.val)) : null}>
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
  inline = true, // inline or popop (for now always inline)
  pretty = false, // make inline inputs pretty
  vertical = false, // label placement
  reset = false, // reset or not
  disableReset, // function to reset the reset mode
  label, // label to display
  nolabel = false, // do not display any label
  labelSx = {}, // label sx
  sx // input sx
}) {
  const propName = val ? (val.prop === undefined ? "Missing property name" : val.prop) : undefined;
  const propVal = val ? (val.val === undefined ? "Missing value" : val.val) : undefined;
  const defVal = val ? (val.def === undefined ? "Missing default value" : val.def) : undefined;

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

/*************************
 *  Add Item Wrapper Form
 *  
 *  Add cancel (or add or reset) and Add (or Register) buttons 
 *  around the item template and set the template component
 *  properties to necessary values (inform, inline, pretty)
 *************************/
function ItemWrapperForm({
  handlers, 
  otherProps, 
  children
}) {
  const defChildProps = {
    inform: true, 
    inline: true, 
    pretty: true, 
    editmode: true,
    noeditdefault: true
  }
  const [childProps, setChildProps] = React.useState(defChildProps);
  const [recaptchaResponse, setRecaptchaResponse] = React.useState('');
  const recaptchaRef = React.useRef();
  var options = {
    cancelLabel: "Cancel",
    cancelAction: () => otherProps.setAddItem(false),
    addLabel: "Add",
    addAction: () => otherProps.setAddItem(false)
  };

  if (otherProps.addItemMode === Globals.addWithPersistentFormNoItems) {
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

  const resetRecaptcha = () => {
    if (recaptchaRef && recaptchaRef.current) {
      setRecaptchaResponse('');
      recaptchaRef.current.reset();
    }
  }

  const resetForm = () => {
    resetRecaptcha();
    setChildProps({
      ...defChildProps, 
      reset: true, 
      disableReset: disableReset
    });
  }
  
  if (otherProps.addItemMode === Globals.addWithPersistentFormAndItems) {
    options = {
      cancelLabel: "Reset",
      cancelAction: () => resetForm(),
      addLabel: "Add",
      addAction: () => resetForm()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otherProps.recaptcha || (otherProps.recaptcha && recaptchaResponse)) {
      var newItem = {};
      for (var i = 0; i < e.target.length - 1; i++) {
        if (e.target[i].type !== "button" && 
            e.target[i].type !== "fieldset" && 
            e.target[i].name !== undefined && 
            e.target[i].defaultValue !== undefined &&
            e.target[i].defaultValue !== null &&
            e.target[i].defaultValue !== "") {
          newItem[e.target[i].name] = e.target[i].defaultValue;
        }
        if (e.target[i].name === Globals.gRecaptchaResponse) {
          newItem[Globals.gRecaptchaResponse] = recaptchaResponse;
        }
      }
      handlers.handleAddItem({
        item: newItem,
        addToLocalList: otherProps.addItemMode === Globals.addWithPersistentFormNoItems ? false : true,
        callback: (success) => {
          if (success) {
            if (options.addMessage) {
              handlers.setErrorMsg(options.addMessage);
            }
            options.addAction();
          }
          //resetRecaptcha();
        }
      })
    }
    else {
      handlers.setErrorMsg({text: Errors.ErrMsg.Recaptcha_Failed});
    }
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
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent={otherProps.recaptcha ? "space-between" : "flex-end"}
      >
        {otherProps.recaptcha &&
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey="6LcH-QkfAAAAAEKeUGIPbeY1OUlN4aQRkMyRoY_V"
            onChange={(value) => setRecaptchaResponse(value)}
            onExpired={() => setRecaptchaResponse('')}
          />
        }
        <Stack 
          direction="row" 
          justifyContent="flex-end"
          alignItems="flex-end"
        >
          <ButtonGroup variant="contained" size="small">
            <Button id="editCancelButton" onClick={() => options.cancelAction()}>{options.cancelLabel}</Button>
            <Button id="editButton" type="submit">{options.addLabel}</Button>
          </ButtonGroup>
        </Stack>
      </Stack>

    </form>
  )
}

function allComponentsAsJson() {
  return { Text, Select, Label, Viewlink, Password, ItemWrapperForm };
}

export { allComponentsAsJson };
