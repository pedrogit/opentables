import React from "react";
import Item from './Item';
import Schema from './common/schema';

// a list receive a schema, a template and a list of items
function List({template, schema, items}) {
  var parsedSchema = new Schema(schema);
  if (template === '') {
    var startStr = '<Mytext val={item.';
    var endstr = '}/>';
    template = startStr + parsedSchema.getRequired().join(endstr + startStr) + endstr;
  }

  return (
    <div>
    {
      items.map(item => {
        return <Item key={item._id} template={template} item={item} />
      })
    }
    </div>
  );
}

export default List;
