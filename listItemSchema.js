const { createMochaInstanceAlreadyRunningError } = require('mocha/lib/errors');
const Utils = require('./utils/utils');
const bcrypt = require('bcrypt');
const Globals = require('./globals');

class ItemSchema {
  constructor(schema) {
    if (schema == null) {
      throw new Error('ItemSchema: Schema can not be null...');
    }
    if (typeof schema === 'string') {
      this.schema = Utils.OTSchemaToJSON(schema);
    }
    else {
      this.schema = schema;      
    }

    if (typeof this.schema !== 'object') {
      throw new Error('ItemSchema: JSON schema is not well formed...');
    }
    this.requiredFields = [];
    var self = this;
    this.validate();
  };

  // traverse a json object calling provided callbacks according to the right level
  traverse(obj, parentKey = null, level = 0, callbacks = null) {
    for (var key in obj) {
      console.log(' '.repeat(2 * (level)) + key + " : " + JSON.stringify(obj[key]));
      
      if (level == 3) {
        throw new Error('Too many levels for ItemSchema "' + this.schema + '"...');
      }
      else if (!(callbacks[level] === null) && typeof callbacks[level] === 'function') {
        callbacks[level](key, obj, parentKey);
      }

      if (obj[key] !== null && typeof(obj[key]) == "object") {
          //going one step down in the object tree!!
          this.traverse(obj[key], key, ++level, callbacks);
          level--;
      };
    };
  };

  // validate that this schema is valid
  validate() {
    this.traverse(this.schema, null, 0, [null, this.validateProperties.bind(this), null]);
    return true;
  };

  // validate this.schema properties
  validateProperties(key, obj, parentKey) {
    const validProperties = ['type', 'required', 'upper', 'lower', 'encrypt']
    if (!(validProperties.includes(key))) {
      throw new Error('ItemSchema: Invalid property (' + key + ') for ' + parentKey + '...');
    }
    if (key == 'required') {
      this.requiredFields.push(parentKey);
    }
  }

  // validate a json string against this schema
  validateJson(jsonstr, strict = true) {
    var json;
    if (typeof jsonstr === 'string') {
      json = Utils.OTSchemaToJSON(jsonstr);
    }
    else {
      json = jsonstr;
    }

    // 1) validate all required fields are present if sctict
    if (strict) {
      const jsonkeys = Object.keys(json);
      console.log(jsonkeys);
      var missingField = '';
      if (!(jsonkeys === null) && 
            !(jsonkeys.length === 0) && 
            !(this.requiredFields.every(field => {var inc = jsonkeys.includes(field); if (!inc) {missingField = field}; return inc}))) {
        throw new Error('ItemSchema: JSON object is not valid. "' + missingField + '" is missing...');
      }
    }

    // 2) if strict invalidate non schema fields
    // 3) validate and sanitize each field
    this.traverse(json, null, 0, [this.validateField.bind(this), null, null]);
    return json;
  };

  // validate passed JSON fields
  validateField(key, obj, parentKey) {
    if (key != Globals.listIdFieldName) {
      if (!(Object.keys(this.schema).includes(key))) {
        throw new Error('ItemSchema: JSON object is not valid. "' + key + '" is not a valid field for this schema...');
      };
      // iterate over each shema property for that field and call the corresponding validator
      for (var property in this.schema[key]) {
        console.log(property + ': ' + this.schema[key][property]);
        if (property != 'required') {
          var validatorName = 'validate_' +  property;
          obj[key] = this[validatorName](this.schema[key][property], key, obj[key]); // pass object by value so the validator can modify it directly
        }
      }
    }
  }

  validate_type(type, key, val) {
    if (typeof val !== type) {
      throw new Error('ItemSchema: JSON object is not valid. Field "' + key + '" value (' + val + ') is not a ' + type + '...');
    }
    return val;
  }

  validate_upper(type, key, val) {
    return val.toUpperCase();
  }

  validate_lower(type, key, val) {
    return val.toLowerCase();
  }

  validate_encrypt(type, key, val) {
    return bcrypt.hashSync(val, bcrypt.genSaltSync(10));
  }
};

module.exports = ItemSchema;
