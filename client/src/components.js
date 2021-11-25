import React from "react";
import Stack from "@mui/material/Stack";

function labelVal(props) {
  return (props.nolabel ? '' : <Label sx={props.labelSx} val={(props.label ? props.label : props.val.prop.capitalize())} separator={!(props.vertical)}/>);
}

function Label(props) {
  var defaultSx = {color: 'red', fontWeight: 'bold', marginRight: 5};
  return (
    <><div style={{...defaultSx, ...props.sx}}>{props.val}{props.separator ? <span> :</span> : ''}</div></>
  );
};

function Text(props) {
  var defaultSx = {};
  return (
    <>
      <Stack direction={props.vertical ? 'column' : 'row'}>
        {labelVal(props)}
        <div style={props.xs}>{props.val.val}</div>
      </Stack></>
  );
};

function allComponentsAsJson() {
  return {Text, Label};
};

export {Text, Label, allComponentsAsJson};