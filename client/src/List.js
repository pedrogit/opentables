import React from "react";
import Item from './Item';
const Schema = require('./common/schema');

// a list receive a schema, a template and a list of items
function List({template, schema, items}) {
  var parsedSchema = new Schema(schema);
  if (template === '') {
    template = parsedSchema.getRequired().map(prop => 
      '<Text val={item.' + prop + '}/> '
    ).join('');
  }

  return (
    <div>
    {
      items.map(item => {
        return  <Item 
                  key={item._id}
                  template={template}
                  item={item}
                />
      })
    }
    </div>
  );
}

export default List;
