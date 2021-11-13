const NodeUtil = require('util');

const Errors = require('./errors');
const Schema = require('./schema');
const Component = require('../component');

const componentRE = new RegExp('\\[\\[(.+?)\\]\\]', 'g');

class Template {
  constructor(template, schema = null) {
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

    if (!this.validate()) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.Schema_InvalidSchema, (typeof schema === 'object' ? JSON.stringify(schema) : '"' + schema + '"')));
    }
  };

  validate() {
    // for now only validate component json strings
    for (const componentStr of this.template.matchAll(componentRE)) {
      var component = new Component(componentStr[1]);
    }
    return true;
  }

  setDefTemplate() {
    this.template = '';
    if (this.schema) {
      this.template = this.schema.getRequired().map(prop => '[[' + prop + ']]').join();
    }
  }

  render(values) {
    return this.template.replace(componentRE, (matchStr, p1, offset, str) => {
      var component = new Component(p1);
      return component.render(values);
    });
  } 
};

module.exports = Template;
