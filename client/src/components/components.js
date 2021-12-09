import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
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
  var sx = { ...defaultSx, ...props.labelSx, ...props.sx };

  if (!props.nolabel) {
    var labelStr = props.label ? props.label : props.val.charAt(0).toUpperCase() + props.val.slice(1)
    var separator = props.vertical ? null : <> :</>;
    return (
      <Typography sx={sx}>
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
  const propVal = props.val ? (props.val.val ? props.val.val : "Missing value") : undefined

  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [elWidth, setElWidth] = React.useState(0);
  const [editVal, setEditVal] = React.useState(propVal);
  const [savedVal, setSavedVal] = React.useState(propVal);

  if (props.val && (propName || editVal)) {

    var defaultSx = {};

    const handleClick = (e) => {
      e.preventDefault();
      setAnchorEl(e.currentTarget);
      setElWidth(e.currentTarget.offsetWidth);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleChange = (val) => {
      setEditVal(val);
    };

    const handleSave = () => {
      if (props.val.patchHandler({ [propName]: editVal })) {
        setSavedVal(editVal);
      }
    };

    const keyPressed = (e) => {
      if (e.keyCode === 13) {
        handleSave();
      }
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    const inputLabel = 'Edit "' + propName + '"...';
    const getWidth = () => {
      const labelFontWidth = 0.75 * theme.typography.fontSize * 0.4;
      const labelW = labelFontWidth * inputLabel.length;
      const inputPadding = 28;
      const popoverPadding = 16;
      return Math.max(
        elWidth + inputPadding + popoverPadding,
        labelW + 2 * labelFontWidth + inputPadding + popoverPadding
      );
    };

    return (
      <>
        <Stack direction={props.vertical ? "column" : "row"}>
          <Label {...{ ...props, val: propName }} />
          <Typography
            sx={{ ...defaultSx, ...props.sx }}
            onDoubleClick={handleClick}
          >
            {savedVal}
          </Typography>
        </Stack>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Box sx={{ p: 1, width: getWidth() }}>
            <TextField
              fullWidth
              id="outlined-basic"
              variant="outlined"
              size="small"
              label={inputLabel}
              value={editVal}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={(e) => keyPressed(e)}
            />
          </Box>
        </Popover>
      </>
    );
  }
  //return "<Text value is missing />";
  return (<Typography color = 'red'>&lt;Text value is missing /&gt;</Typography>);
}

function allComponentsAsJson() {
  return { Text, Label };
}

export { Text, Label, allComponentsAsJson };
