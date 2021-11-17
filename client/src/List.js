import React from "react";
import Item from './Item';
import TemplateParser from './common/templateParser';


// a list receive a schema, a template and a list of items
function List({template, schema, items}) {
  var parsedTemplate = new TemplateParser(template, schema);

  return (
    <div>
    {
      items.map(item => {
        return <Item key={item._id} parsedTemplate={parsedTemplate} item={item} />
      })
    }
    </div>
  );
}

export default List;
