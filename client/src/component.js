import React from "react";

const ComponentParser = require('./common/componentParser');

/*class Component {
  constructor(componentStr) {
    try {
      this.component = new ComponentParser(componentStr);
    }
    finally {

    }
  };

  static getRegExp() {
    return new RegExp('\\[\\[(.+?)\\]\\]', 'g');
  }

  render(values) {
    return (
      <p>
        {values[this.component.targetProp] === undefined ? '' : values[this.component.targetProp]}
      </p>
    );
  }
}*/

function Component({propStr, values}) {
  var parsedProps = new ComponentParser(propStr);
  return (<span class='component'>{(values[parsedProps.targetProp] === undefined ? '' : values[parsedProps.targetProp])}</span>);
}

export default Component;
