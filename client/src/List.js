import React from "react";
import Item from './Item';
import Stack from "@mui/material/Stack";

const Schema = require('./common/schema');

// a list receive a schema, a template and a list of items
function List({template, schema, items}) {
  var parsedSchema = new Schema(schema);
  if (template === '') {
    template = parsedSchema.getRequired().map(prop => 
      '<Text val={' + prop + '} /> '
    ).join('');
  }

  var i = 0;

  return (
    <Stack>
    {
      items.map(item => {
        i = 1 - i;
        return  <Item 
                  key={item._id}
                  template={template}
                  item={item}
                  sx={{backgroundColor: (i ? '#FFF' : '#EEE')}}
                />
      })
    }
    </Stack>
  );
}

export default List;
