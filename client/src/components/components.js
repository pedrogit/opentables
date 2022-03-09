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
function Label({val, vertical, label, nolabel, sx}) {
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
    var labelStr = label ? label : val.charAt(0).toUpperCase() + val.slice(1)
    var separator = vertical ? null : <>&nbsp;:</>;
    return (
      <Typography sx={{ ...defaultSx, ...sx }}>
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
function Text({val, inline, open, vertical, label, nolabel, labelSx, sx}) {
  const propName = val ? (val.prop ? val.prop : "Missing property name") : undefined;
  const initPropVal = val ? (val.val ? val.val : "Missing value") : undefined

  const valueRef = React.useRef();
  const theme = useTheme();

  const [editVal, setEditVal] = React.useState(initPropVal);
  const [propVal, setPropVal] = React.useState(initPropVal);

  const [editing, setEditing] = React.useState(false);

  if (val && (propName || editVal)) {

    var defaultSx = {};

    const handleEdit = (e) => {
      val.handleItemAuth('patch', val.prop, (auth) => {
        setEditing(true);
      });
    };

    const handleChange = (val) => {
      setEditVal(val);
    };

    const handleSave = () => {
      val.handlePatch({ [propName]: editVal }, (success, val) => {
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
        <Stack direction={vertical ? "column" : "row"}>
          <Label val={propName} vertical={vertical} label={label} nolabel={nolabel} sx={labelSx} />
          {editing && inline ? (
            <ClickAwayListener onClickAway={() => setEditing(false)}>
              <Input
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
          open={!inline && editing}
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
  return (<Typography color = 'red'>&lt;Text value is missing /&gt;</Typography>);
}

function Listlink({text, listid}) {
  return (
    <Link onClick={() => (listid.setViewId)(listid.val)}>{text ? (text.val ? text.val : "No text property...") : "No text property..."}</Link>
  )
}

function allComponentsAsJson() {
  return { Text, Label, Listlink };
}

export { Text, Label, Listlink, allComponentsAsJson };
