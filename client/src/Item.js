import React from "react";

function Item({template, item}) {
//function Item(props) {
    return (
    <div>
      {template.render(item)}
    <br /><br />
    </div>
  );
}

export default Item;
