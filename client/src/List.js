import React from "react";
import Item from './Item';
import Stack from "@mui/material/Stack";

const Schema = require('./common/schema');

// a list receive a schema, a template and a list of items
function List({template, schema, items}) {
  var parsedSchema = new Schema(schema);
  if (template === '') {
    /*template = '<Box sx={{borderRadius:5, border:1, padding:2}}>' + parsedSchema.getRequired().map(prop => 
      '<Text val={' + prop + '} /> '
    ).join('') + '</Box>';*/
    template = parsedSchema.getRequired(true).map(prop => 
      '<Text val={' + prop + '}/> '
    ).join('');
  }

  var rowNb = 0;

  return (
    <Stack>
    {
      items.map(item => {
        rowNb = rowNb + 1;
        return  <Item 
                  key={item._id}
                  template={template}
                  item={item}
                  rowNb={rowNb}
                />
      })
    }
    </Stack>
  );
}

export default List;
