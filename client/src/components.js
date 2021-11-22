import React from "react";

function Text(props) {
  var labelTag = props.nolabel ? '' : <span>{(props.label ? props.label : 'toto')}</span>;
  return (
    <>{labelTag}<span>{props.val}</span></>
  );
};

function allComponentsAsJson() {
  return {Text};
};

export {Text, allComponentsAsJson};