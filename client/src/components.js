import React from "react";

function Label(props) {
  var defaultSx = {color: 'red'};
  var style = {...props.xs, ...defaultSx};
  return (
    <><span style={style}>{props.label}: </span></>
  );
};

function Text(props) {
  var labelText = props.label ? props.label : 'toto';
  var labelTag = (props.nolabel ? '' : <Label label={labelText}/>);
  return (
    <>{labelTag}<span>{props.val}</span></>
  );
};

function allComponentsAsJson() {
  return {Text, Label};
};

export {Text, Label, allComponentsAsJson};