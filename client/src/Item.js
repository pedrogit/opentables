import React from "react";

//function Item({template, item}) {
function Item(props) {
    return (
    <div>
      {props.template.render(props.item)}
    <br /><br />
    </div>
  );
}

export default Item;
