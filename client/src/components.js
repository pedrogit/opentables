import React from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

function labelVal(props) {
  var fs = props.vertical ? '0.8em' : null;
  var sx = {...props.labelSx, fontSize: fs};
  return (props.nolabel ? '' : <Label sx={sx} val={(props.label ? props.label : props.val.prop.capitalize())} separator={!(props.vertical)}/>);
}

function Label(props) {
  var defaultSx = {color: 'red', fontWeight: 'bold', marginRight: 1};
  return (
    <>
      <Box sx={{...defaultSx, ...props.sx}}>
        {props.val}{props.separator ? <> :</> : null}
      </Box>
    </>
  );
};

function Text(props) {
  var defaultSx = {};
  return (
    <>
      <Stack direction={props.vertical ? 'column' : 'row'}>
        {labelVal(props)}
        <Box sx={{...defaultSx, ...props.sx}}>
          {props.val.val}
        </Box>
      </Stack>
    </>
  );
};

function allComponentsAsJson() {
  return {Text, Label};
};

export {Text, Label, allComponentsAsJson};