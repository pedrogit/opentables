import React from "react";
import Item from './Item';
import Template from './template';

// a list receive a schema, a template and a list of items
function List(props) {
  var newTemplate = new Template(props.template, props.schema);
  return (
    <div>
    {
      props.items.map(item => {
        return <Item key={item._id} template={newTemplate} item={item} />
      })
    }
    </div>
  );
}

export default List;
