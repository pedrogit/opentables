import React from "react";
import JsxParser from 'react-jsx-parser'

import Mytext from './components';

function Item({template, item}) {
  return (
      <JsxParser
        bindings={{item: item}}
        components={{Mytext}}
        jsx={template}
      />
  );
}

export default Item;
