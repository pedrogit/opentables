import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import { useTheme, useThemeProps } from '@mui/material/styles';

/********************
*  Label component
********************/
function Label(props) {
  const theme = useTheme();
  var fontSize = props.vertical ? theme.typography.caption : theme.typography.body1;
  var defaultSx = {fontSize: fontSize, color: theme.palette.primary.main, fontWeight: 'bold', marginRight: 1};
  var sx = {...defaultSx, ...props.labelSx, ...props.sx};
  
  if (!props.nolabel) {
    var labelStr = props.label ? props.label : props.val.capitalize();
    var separator = props.vertical ? null : <> :</>
    return (
      <Typography sx={sx}>{labelStr}{separator}</Typography>
    );
  }

  return null;
};

/********************
*  Text component
********************/
function Text(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [elWidth, setElWidth] = React.useState(0);
  const [editVal, setEditVal] = React.useState(props.val.val);
  const [savedVal, setSavedVal] = React.useState(props.val.val);

  if (props.val) {
    var defaultSx = {};

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
      setElWidth(event.currentTarget.offsetWidth);
    };

    const handleClose = () => {
      setAnchorEl(null);
      setSavedVal(editVal);
    };

    const handleChange = (val) => {
      setEditVal(val);
    }

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const inputLabel = () => 'Edit "' +  props.val.prop + '"...';
    const getWidth = () => {
      var labelW = 5 * (inputLabel().length);
      return Math.max(elWidth + 34, labelW + 28);
    }

    return (
      <>
        <Stack direction={props.vertical ? 'column' : 'row'}>
          <Label {...{...props, val: props.val.prop}}/>
          <Typography sx={{...defaultSx, ...props.sx}} onDoubleClick={handleClick}>
            {savedVal}
          </Typography>
        </Stack>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box sx={{p: 1, width: getWidth()}}>
            <TextField 
              fullWidth 
              id="outlined-basic" 
              variant="outlined" 
              size="small"
              label={inputLabel()}
              value={editVal}
              onChange={e => handleChange(e.target.value)}
            />
          </Box>
        </Popover>
      </>
    );
  }
  return '';
};

function allComponentsAsJson() {
  return {Text, Label};
};

export {Text, Label, allComponentsAsJson};