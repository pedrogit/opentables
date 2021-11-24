import React from "react";

function Label(props) {
  var defaultSx = {color: 'red'};
  var style = {...props.xs, ...defaultSx};
  return (
    <><span style={style}>{props.label}: </span></>
  );
};

function Text(props) {
return (
    <>{(props.label ? <Label label={props.label}/> : '')}<span>{props.val}</span></>
  );
};

function allComponentsAsJson() {
  return {Text, Label};
};

export {Text, Label, allComponentsAsJson};