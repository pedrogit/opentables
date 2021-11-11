const NodeUtil = require('util');

const Globals = require('./globals');
const Utils = require('./utils');
const Errors = require('./errors');
const Schema = require('./schema');

class Template {
  constructor(template, schema) {
    this.template = template.toString();
    if (typeof schema === 'string') {
      try {
         this.schema = new Schema(schema);
      } catch(err) {
        throw new Error(NodeUtil.format(Errors.ErrMsg.Schema_InvalidSchema, schema, err.message));
      }
    }
    else {
      this.schema = schema;      
    }

    if (!this.template || this.template === '') {
      this.setDefTemplate();
    }

    this.regexp = new RegExp('\[\[' + Globals.identifierRegEx + '\]\]', 'g');
  };

  setDefTemplate() {
    this.template = this.schema.getRequired().map(prop => '[[' + prop + ']]').join();
  }

  replaceValues(values) {
    return this.template.replace(this.regexp, (matchStr, offset, str) => {
      var prop = matchStr.match(new RegExp(Globals.identifierRegEx));
      return (values[prop] === undefined ? '' : values[prop]);
    });
  } 

};

module.exports = Template;
