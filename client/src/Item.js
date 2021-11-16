import React from "react";

function Item({template, item}) {
    return (
    <div class='item'>
      {template.render(item)}
    </div>
  );
}

export default Item;
