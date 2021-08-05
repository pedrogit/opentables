//var assert = require('assert');

const Utils = require('./utils/utils');

class ItemSchema {
  constructor(schema) {
    if (schema == null) {
      throw new Error('ItemSchema can not be null...');
    }
    if (typeof schema === 'string') {
      this.schema = Utils.OTSchemaToJSON(schema);
    }
    else {
      this.schema = schema;      
    }

    if (typeof this.schema !== 'object') {
      throw new Error('ItemSchema: Passed schema is not a valid object...');
    }
    this.validate();
  };

  // validate that this schema is valid
  validate() {
    this.traverse(this.schema);
    return true;
  };

  // validate a json strin against this schema
  validateJson(jsonstr) {
    // 1) validate required fields
    // 2) if strict invalidate non schema fields
    // 3) validate and sanitize each field
    return true;
  };

  func(key, value, level) {
    console.log(' '.repeat(2 * (level - 1)) + key + " : " + JSON.stringify(value));
  }

  traverse(obj, level = 1) {
    if (level == 4) {
      throw new Error('Too many level for schema ' + this.schema);
    }
    for (var i in obj) {
        this.func(i, obj[i], level);  
        if (obj[i] !== null && typeof(obj[i]) == "object") {
            //going one step down in the object tree!!
            this.traverse(obj[i], ++level);
            level--;
        }
    }
  }
}

module.exports = ItemSchema;
