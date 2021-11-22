import React from "react";
import JsxParser from 'react-jsx-parser';

import * as Components from './components';

// Define all components in the current scope 
// so they can be used directly, without 
// namespace (e.g. Components.Text), in the template
for (let name in Components) {
  global[name] = Components[name];
}

function Item({template, item}) {
  return (
    <div className='item'>
      <JsxParser 
        bindings={{item: item}}
        components={Components.allComponentsAsJson()}
        jsx={template}
        renderInWrapper={false}
        onError={() => {}}
        renderError={({error}) => <span>{error}</span>}
        showWarnings={false}
        allowUnknownElements = {false}
        renderUnrecognized={tagName => <span style={{color: "red"}}>Error: unrecognized tag ({tagName})...</span>} 
      />
    </div>
  );
}

export default Item;
