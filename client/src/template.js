import React from "react";

import Component from './component';
import TemplateParser from './common/templateParser';

const reactStringReplace = require('react-string-replace');


class Template {
  constructor(template, schema) {
    try {
      this.templateParser = new TemplateParser(template, schema);
    }
    finally {

    }
  };

  render(values) {
    var test = reactStringReplace(this.templateParser.template, 
      new RegExp('\\[\\[(.+?)\\]\\]', 'g'),
      (match, i) => (
        <span>{React.createElement(Component, {propStr: "email: {control: text}", values: values})}</span>
      )
    )

    return (
      <div class='template'>
        {
          reactStringReplace(
            this.templateParser.template, 
            new RegExp('\\[\\[(.+?)\\]\\]', 'g'), (match, i) => (
              React.createElement(Component, {key: i, propStr: "email: {control: text}", values: values})
            )
          )
          .filter(item => item !== '')
          .map(item => (typeof item === 'object' ? item : <span class='dangerouslySetInnerHTML' dangerouslySetInnerHTML={{__html: item}}/>))
        }
      </div>
    );
  }
}

export default Template;
