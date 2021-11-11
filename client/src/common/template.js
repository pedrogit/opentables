const Schema = require('./schema');
const Component = require('../component');

class Template {
  constructor(template, schema) {
    this.template = template.toString();
    if (typeof schema === 'string') {
         this.schema = new Schema(schema);
    }
    else {
      this.schema = schema;
    }

    if (!this.template || this.template === '') {
      this.setDefTemplate();
    }
  };

  setDefTemplate() {
    this.template = this.schema.getRequired().map(prop => '[[' + prop + ']]').join();
  }

  render(values) {
    var componentRE = new RegExp('\\[\\[(.+?)\\]\\]', 'g');
    return this.template.replace(componentRE, (matchStr, p1, offset, str) => {
      var component = new Component(p1);
      return component.render(values);
    });
  } 
};

module.exports = Template;
