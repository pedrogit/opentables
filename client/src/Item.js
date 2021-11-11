import React from "react";
const Template = require('./common/template');

function Item({template, schema, item}) {
  var newTemplate = new Template(template, schema);

  return (
    <div>
      {newTemplate.replaceValues(item)}
    <br /><br />
    </div>
  );
}

export default Item;
