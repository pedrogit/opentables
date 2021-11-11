import React from "react";
import Item from './Item';

// a list receive a schema, a template and a list of items
function List(props) {
  console.log('List rendered');
  return (
    <div>
    {
      props.items.map(item => {
        return <Item key={item._id} template={props.template} schema={props.schema} item={item} />
      })
    }
    </div>
  );
}

export default List;
