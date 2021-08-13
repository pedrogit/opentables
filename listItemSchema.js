const { createMochaInstanceAlreadyRunningError } = require('mocha/lib/errors');
const Utils = require('./utils/utils');
const Errors = require('./utils/errors');
const NodeUtil = require('util');

const bcrypt = require('bcrypt');
const Globals = require('./globals');

class ItemSchema {
  constructor(schema) {
    if (schema == null) {
      throw new Error(Errors.ErrMsg.ItemSchema_Null);
    }
    if (typeof schema === 'string') {
      this.schema = this.simplifiedSchemaToJSON(schema);
    }
    else {
      this.schema = schema;      
    }

    if (typeof this.schema !== 'object') {
      throw new Error(Errors.ErrMsg.ItemSchema_Malformed);
    }
    this.requiredFields = [];
    var self = this;
    this.validate();

  };

  simplifiedSchemaToJSON(simplifiedSchema) {
    // double quote keys
    var jsonSchema = Utils.completeTrueValues(simplifiedSchema);
    jsonSchema = Utils.trimFromEdges(jsonSchema, ['{', '}'], true, true);
    jsonSchema = Utils.doubleQuoteWordValues(jsonSchema);
    jsonSchema = '{' + Utils.doubleQuoteKeys(jsonSchema) + '}';
    var parsedSchema = '';
    try {
      parsedSchema = JSON.parse(jsonSchema);
    } catch(err) {
      throw new Error(NodeUtils.format(Errors.ErrMsg.ItemSchema_InvalidSchema, simplifiedSchema));
    }
    return parsedSchema;
  }

  // traverse a json object calling provided callbacks according to the right level
  traverse(obj, parentKey = null, level = 0, callbacks = null) {
    for (var key in obj) {
      //console.log(' '.repeat(2 * (level)) + key + " : " + JSON.stringify(obj[key]));
      
      if (level == 3) {
        throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_TooManyLevels, this.schema));
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
    this.traverse(this.schema, null, 0, [this.validateSchemaFirstLevelProperties.bind(this), 
                                         this.validateSchemaSecondLevelProperties.bind(this), 
                                         null]);
    return true;
  };

  // validate this.schema first level properties
  validateSchemaFirstLevelProperties(key, obj, parentKey) {
    const validProperties = ['string', 'number', 'encrypted_string']
    if (obj[key] !== null && typeof(obj[key]) !== "object"){
      if (!(validProperties.includes(obj[key].toLowerCase())))
        throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidSchemaParameter, obj[key], key));
    }
  }

  // validate this.schema second level properties
  validateSchemaSecondLevelProperties(key, obj, parentKey) {
    const validProperties = ['type', 'required', 'upper', 'lower', 'encrypt']
    if (!(validProperties.includes(key))) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidValue, key, parentKey));
    }
    if (key == 'required') {
      this.requiredFields.push(parentKey);
    }
  }


  // validate a json string against this schema
  validateJson(jsonstr, strict = true) {
    var json;
    if (typeof jsonstr === 'string') {
      json = this.simplifiedSchemaToJSON(jsonstr);
    }
    else {
      json = jsonstr;
    }

    // 1) validate all required fields are present if strict
    if (strict) {
      const jsonkeys = Object.keys(json);
      //console.log(jsonkeys);
      var missingField = '';
      if (!(jsonkeys === null) && 
            !(jsonkeys.length === 0) && 
            !(this.requiredFields.every(field => {var inc = jsonkeys.includes(field); if (!inc) {missingField = field}; return inc}))) {
              throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_MissingField, missingField));
      }
    }

    // 2) if strict invalidate non schema fields
    // 3) validate and sanitize each field
    this.traverse(json, null, 0, [this.validateField.bind(this), null, null]);
    return json;
  };

  // validate passed JSON fields
  validateField(key, obj, parentKey) {
    if (key != Globals.listIdFieldName) { // ignore the listid field since it is vaidated by the controler
      if (!(Object.keys(this.schema).includes(key))) {
        throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidField, key));
      };
      // if this.schema[key] is an object iterate over each schema property for that field and call the corresponding validator
      if (typeof(this.schema[key]) === "object") {
        for (var property in this.schema[key]) {
          //console.log(property + ': ' + this.schema[key][property]);
          if (property != 'required') {
            var validatorName = 'validate_' +  property;
            obj[key] = this[validatorName](this.schema[key][property], key, obj[key]); // pass object by value so the validator can modify it directly
          }
        }
      }
      // if this.schema[key] is a simple type handle it
      else {
        obj[key] = this.validate_type(this.schema[key], key, obj[key]);
      }
    }
  }

  validate_type(type, key, val) {
    if (typeof val !== type) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, key, val, type));
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
