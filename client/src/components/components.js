import React from "react";
import Stack from "@mui/material/Stack";
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
function Label(props) {
  const theme = useTheme();
  var fontSize = props.vertical
    ? theme.typography.caption
    : theme.typography.body1;

  var defaultSx = {
    fontSize: fontSize,
    color: theme.palette.primary.main,
    fontWeight: "bold",
    marginRight: 1,
  };

  if (!props.nolabel) {
    var labelStr = props.label ? props.label : props.val.charAt(0).toUpperCase() + props.val.slice(1)
    var separator = props.vertical ? null : <>&nbsp;:</>;
    return (
      <Typography sx={{ ...defaultSx, ...props.labelSx, ...props.sx }}>
        {labelStr}
        {separator}
      </Typography>
    );
  }

  return null;
}

/********************
 *  Text component
 ********************/
function Text(props) {
  const propName = props.val ? (props.val.prop ? props.val.prop : "Missing property name") : undefined;
  const initPropVal = props.val ? (props.val.val ? props.val.val : "Missing value") : undefined

  const valueRef = React.useRef();
  const theme = useTheme();
  //const [anchorEl, setAnchorEl] = React.useState(null);
  //const [elWidth, setElWidth] = React.useState(0);
  const [editVal, setEditVal] = React.useState(initPropVal);
  const [propVal, setPropVal] = React.useState(initPropVal);

  const [editing, setEditing] = React.useState(false);

  if (props.val && (propName || editVal)) {

    var defaultSx = {};

    const handleEdit = (e) => {
      props.val.handleItemAuth('patch', props.val.prop, (auth) => {
        setEditing(true);
      });
    };

    const handleChange = (val) => {
      setEditVal(val);
    };

    const handleSave = () => {
      props.val.handlePatch({ [propName]: editVal }, (success, val) => {
        setPropVal(val);
        setEditing(false);
      });
    };

    const keyPressed = (e) => {
      if (e.keyCode === 13) { // enter
        handleSave();
      }
      if (e.keyCode === 27) { // escape
        setEditing(false);
      }
    };

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
        <Stack direction={props.vertical ? "column" : "row"}>
          <Label {...{ ...props, val: propName }} />
          {editing && props.inline ? (
            <ClickAwayListener onClickAway={() => setEditing(false)}>
              <Input
                sx={{ ...defaultSx, ...props.sx, backgroundColor: theme.palette.primary.palebg}}
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
          ) : (
            <Typography
              sx={{ ...defaultSx, ...props.sx }}
              onDoubleClick={handleEdit}
              ref={valueRef}
            >
              {propVal}
            </Typography>
          )}
        </Stack>
        <Popover
          open={!props.inline && editing}
          anchorEl={valueRef.current}
          onClose={() => setEditing(false)}
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
  //return "<Text value is missing />";
  return (<Typography color = 'red'>&lt;Text value is missing /&gt;</Typography>);
}

function Listlink(props) {
  var extractValues = (props) => {
    var result = {};
    for (var key in props) {
      if (props.hasOwnProperty(key)) {
        result[key] = props[key] ? (props[key].val ? props[key].val : "Missing value") : undefined;
        result['setViewId'] = props[key] ? (result.setViewId ? result.setViewId : props[key].setViewId) : result.setViewId;
      }
    }
    return result;
  }

  var {text, listid, setViewId} = extractValues(props);
  return (
    <Link onClick={() => setViewId(listid)}>{text}</Link>
  )
}

function allComponentsAsJson() {
  return { Text, Label, Listlink };
}

export { Text, Label, Listlink, allComponentsAsJson };
