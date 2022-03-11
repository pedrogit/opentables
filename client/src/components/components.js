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
  edit = false,
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
  const [editing, setEditing] = React.useState(false);

  if (val && (propName || editVal)) {

    var defaultSx = {};

    const handleEdit = (e) => {
      if (!inform) {
        val.handleItemAuth({
          action: 'patch', 
          propName: val.prop, 
          callback: (auth) => {
            setEditing(true);
          }
        });
      }
    };

    const handleChange = (val) => {
      setEditVal(val);
    };

    const handleSave = () => {
      if (!inform) {
        val.handleSaveProperties({ [propName]: editVal }, (success, val) => {
          editingOff();
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
        editingOff()
      }
    };

    const editingOff = () => {
      if (!inform) {
        setEditing(false);
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
          {(edit || editing) && inline ? (
            <>
            <ClickAwayListener onClickAway={editingOff}>
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
          open={(edit || editing) && !inline}
          anchorEl={valueRef.current}
          onClose={editingOff}
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

function Form({handlers, children, edit = false}) {
  const [editing, setEditing] = React.useState(edit);
  const [childProps, setChildrenProps] = React.useState({inform: true, inline: true, edit: edit});

  const handleSubmit = (e) => {
    e.preventDefault();
    var newVal = {};
    for (var i = 0; i < e.target.length - 1; i++) {
      if (e.target[i].name !== "submitButton") {
        newVal[e.target[i].name] = e.target[i].defaultValue;
      }
    }
    handlers.handleSaveProperties(newVal, () =>{
      editingOff(null, newVal);
    })
  }

  const handleEdit = (e) => {
    handlers.handleListAuth({
      action: 'patch', 
      callback: (auth) => {
        setChildrenProps({inform: true, inline: true, edit: true});
        setEditing(true);
      }
    });
  };

  const childrenWithProp = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, childProps);  
    }
    return child;
  });

  const editingOff = () => {
    if (!edit) {
      setChildrenProps({inform: true, inline: true, edit: false});
      setEditing(false);
    }
  }

  const keyPressed = (e) => {
    if (e.keyCode === 27) { // escape
      editingOff();
    }
  };

  return (
    <ClickAwayListener onClickAway={editingOff}>
      <form 
        onSubmit={handleSubmit}
        onDoubleClick={handleEdit}
        onKeyDown={(e) => keyPressed(e)}
      >
        {childrenWithProp}
        {(edit || editing) ? (
          <Stack direction="row" justifyContent="flex-end">
            <ButtonGroup variant="contained" size="small">
              <Button id="editCancelButton" onClick={editingOff}>Cancel</Button>
              <Button id="editButton" type="submit">Save</Button>
            </ButtonGroup>
          </Stack>
          ) : null
        }
      </form>
    </ClickAwayListener>
  )
}

function allComponentsAsJson() {
  return { Text, Label, Listlink, Form };
}

export { allComponentsAsJson };
