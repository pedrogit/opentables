import React from "react";
import Item from './Item';
import Schema from './common/schema';

// a list receive a schema, a template and a list of items
function List({template, schema, items}) {
  var parsedSchema = new Schema(schema);
  if (template === '') {
    var startStr = '<Hrx>hhhrxxxx</Hrx><Mytext val={item.';
    var endStr = '}/>';
    template = startStr + parsedSchema.getRequired().join(endStr + startStr) + endStr;
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
