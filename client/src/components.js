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
  var defaultSx = {};
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const editLabel = () => 'Edit the "' +  props.val.prop + '" property...';
  const getWidth = () => 8*Math.max(props.val.val.length, editLabel().length);

  return (
    <>
      <Stack direction={props.vertical ? 'column' : 'row'}>
        {labelVal(props)}
        <Typography sx={{...defaultSx, ...props.sx}} onDoubleClick={handleClick}>
          {props.val.val}
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
          <Label val={editLabel()} sx={{fontSize: 12}}/>
          <TextField 
             fullWidth 
             id="filled-basic" 
             xlabel={'Edit the "' +  props.val.prop + '" property...'} 
             variant="filled" 
             defaultValue={props.val.val}
             size="small"/>
        </Box>
      </Popover>
    </>
  );
};

function allComponentsAsJson() {
  return {Text, Label};
};

export {Text, Label, allComponentsAsJson};