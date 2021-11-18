import React from "react";

function Mytext({val}) {
  return (
    <span>{val}</span>
  );
};

function allComponentsAsJson() {
  return {Mytext};
};

export {Mytext, allComponentsAsJson};