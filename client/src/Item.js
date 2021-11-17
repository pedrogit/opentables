import React from "react";

import Component from './component';

const reactStringReplace = require('react-string-replace');

function Item({parsedTemplate, item}) {
  //var templateParser = new TemplateParser(template, schema);
  /*var test = reactStringReplace(templateParser.template, 
    new RegExp('\\[\\[(.+?)\\]\\]', 'g'),
    (match, i) => (
      <span>{React.createElement(Component, {propStr: "email: {control: text}", values: values})}</span>
    )
  );*/
  return (
    <div class='item'>
      {
        reactStringReplace(
          parsedTemplate.template, 
          new RegExp('\\[\\[(.+?)\\]\\]', 'g'), (match, i) => (
            React.createElement(Component, {key: i, propStr: "email: {control: text}", values: item})
          )
        )
        .filter(item => item !== '')
        .map(item => (typeof item === 'object' ? item : <span class='dangerouslySetInnerHTML' dangerouslySetInnerHTML={{__html: item}}/>))
      }
    </div>
  );
}

export default Item;
