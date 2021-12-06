import React from "react";

const ComponentParser = require("./common/componentParser");

function Component({ propStr, values }) {
  var parsedProps = new ComponentParser(propStr);
  return (
    <>
      {values[parsedProps.targetProp] === undefined
        ? ""
        : values[parsedProps.targetProp]}
    </>
  );
}

export default Component;
