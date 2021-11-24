import React from "react";

function labelVal(props) {
  return (props.nolabel ? '' : <Label val={(props.label ? props.label : props.val.prop.capitalize())}/>);
}

function Label(props) {
  var defaultSx = {color: 'red', fontWeight: 'bold'};
  var style = {...defaultSx, ...props.xs };
  return (
    <><span style={style}>{props.val}: </span></>
  );
};

function Text(props) {
  return (
    <>{labelVal(props)}<span>{props.val.val}</span></>
  );
};

function allComponentsAsJson() {
  return {Text, Label};
};

export {Text, Label, allComponentsAsJson};