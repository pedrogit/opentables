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
      try {
         this.schema = Utils.simpleJSONToJSON(schema);
      } catch(err) {
        throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidSchema, schema));
      }
    }
    else {
      this.schema = schema;      
    }

    if (typeof this.schema !== 'object') {
      throw new Error(Errors.ErrMsg.ItemSchema_Malformed);
    }
    this.requiredFields = [];
    this.validate();
  };

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
    if (obj[key] !== null && typeof(obj[key]) !== "object") {
      if (this['validate_type_' +  obj[key]] === undefined) {
        throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidSchemaParameter, obj[key], key));
      }
    }
  }

  // validate this.schema second level properties
  validateSchemaSecondLevelProperties(key, obj, parentKey) {
    if (key === 'required') {
      this.requiredFields.push(parentKey);
    }
    else if (this['validate_' +  key] === undefined) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidValue, key, parentKey));
    }
  }


  // validate a json string against this schema
  validateJson(jsonstr, strict = true) {
    var json;
    if (typeof jsonstr === 'string') {
      try {
        json = Utils.simpleJSONToJSON(jsonstr);
      } catch(err) {
        throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidSchema, schema));
      }
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
          if (property != 'required') {
            var validatorName = 'validate_' +  property;
            obj[key] = this[validatorName](this.schema[key][property], key, obj[key]); // pass object by value so the validator can modify it directly
          }
        }
      }
      // if this.schema[key] is a simple type validate it
      else {
        obj[key] = this.validate_type(this.schema[key], key, obj[key]);
      }
    }
  }

  validate_type(type, key, val) {
    var typeValidatorName = 'validate_type_' +  type;
    val = this[typeValidatorName](key, val);

    return val;
  }

  validate_type_string(key, val) {
    if (typeof val !== 'string') {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, key, val, 'string'));
    }
    return val;
  }

  validate_type_number(key, val) {
    if (typeof val !== 'number') {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, key, val, 'number'));
    }
    return val;
  }

  validate_type_schema(key, val) {
    if (typeof val !== 'string') {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, key, val, 'number'));
    }
    new ItemSchema(val);
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

  validate_type_email(key, email) {
    const emailError = new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, key, email, 'email'));
    var emailRegExp = new RegExp('^[-!#$%&\'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&\'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$');
    if (!email) {
      throw emailError;
    }

    var emailParts = email.split('@');
  
    if (emailParts.length !== 2) {
      throw emailError;
    }
  
    var account = emailParts[0];
    var address = emailParts[1];
  
    if (account.length > 64) {
      throw emailError;
    }
    else if(address.length > 255) {
      throw emailError;
    }
    var domainParts = address.split('.');
    if (domainParts.some(function (part) {
                           return part.length > 63;
                         })) {
      throw emailError;
    }
  
    if (!emailRegExp.test(email)) {
      throw emailError;
    }
  
    return email.toLowerCase();
  }
};

module.exports = ItemSchema;
