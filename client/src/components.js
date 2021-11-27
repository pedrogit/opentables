import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';

function labelVal(props) {
  var fs = props.vertical ? '0.8em' : null;
  var sx = {...props.labelSx, fontSize: fs};
  return (props.nolabel ? '' : <Label sx={sx} val={(props.label ? props.label : props.val.prop.capitalize())} separator={!(props.vertical)}/>);
}

function Label(props) {
  var defaultSx = {color: 'red', fontWeight: 'bold', marginRight: 1};
  return (
    <>
      <Typography sx={{...defaultSx, ...props.sx}}>
        {props.val}{props.separator ? <> :</> : null}
      </Typography>
    </>
  );
};

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
          {labelVal(props)}
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