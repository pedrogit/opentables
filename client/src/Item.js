import React from "react";
import JsxParser from 'react-jsx-parser';
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

import * as Components from './components';

// Define all components in the current scope 
// so they can be used directly, without 
// namespace (e.g. Components.Text), in the template
for (let name in Components) {
  global[name] = Components[name];
}

function Item({template, item, rowNb}) {
  // reassign item properties with a two propety object 
  // including the name of the property so components can acces it
  var defaultSx = {bgcolor: (rowNb % 2 ? '#FFF' : '#EEE'), padding: 1};

  var setBindings = function (item) {
    var result = {};
    for (var key in item){
      if (item.hasOwnProperty(key)) {
        result[key] = {prop: key, val: item[key]}
      }
    }
    return result;
  }

  return (
    <Box className='item' sx={defaultSx}>
      <JsxParser 
        bindings={setBindings(item)}
        components={{...Components.allComponentsAsJson(), Box, Stack}}
        jsx={template}
        renderInWrapper={false}
        onError={() => {}}
        renderError={({error}) => <span>{error}</span>}
        showWarnings={false}
        allowUnknownElements = {false}
        renderUnrecognized={tagName => <span style={{color: "red"}}>Error: unrecognized tag ({tagName})...</span>} 
      />
    </Box>
  );
}

export default Item;
