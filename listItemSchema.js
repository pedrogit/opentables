const MongoDB = require('mongodb');
const Utils = require('./utils/utils');
const Errors = require('./utils/errors');
const NodeUtil = require('util');

const bcrypt = require('bcrypt');
const Globals = require('./globals');

class ItemSchema {
  constructor(schema, controler = null, listid = null) {
    if (schema == null) {
      throw new Error(Errors.ErrMsg.ItemSchema_Null);
    }
    if (typeof schema === 'string') {
      try {
         this.schema = Utils.simpleJSONToJSON(schema);
      } catch(err) {
        throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidSchema, schema, err.message));
      }
    }
    else {
      this.schema = schema;      
    }

    if (listid !== null) {
      this.listid = listid;
    }

    if (controler !== null) {
      this.controler = controler;
    }

    if (typeof this.schema !== 'object') {
      throw new Error(Errors.ErrMsg.ItemSchema_Malformed);
    }
    this.requiredFields = [];
    this.validate();
  };

  schemaAsJson() {
    return this.schema;
  }

  getEmbeddedItems() {
    var embItems = [];
    for (var key in this.schema) {
      if (this.schema[key] === 'embedded_itemid' || 
          this.schema[key] === 'embedded_listid' ||
          this.schema[key] === 'embedded_itemid_list' ){
        var item = {};
        item.type = this.schema[key];
        embItems.push({[key]: item});
      }
      else if (this.schema[key].type === 'embedded_itemid' || 
               this.schema[key].type === 'embedded_itemid_list') {
        embItems.push({[key]: this.schema[key]});
      }
    }

    return embItems;
  }

  // traverse a json object calling provided callbacks according to the right level
  traverseSync(obj, parentKey = null, level = 0, callbacks = null) {
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
            this.traverseSync(obj[key], key, ++level, callbacks);
          level--;
      };
    };
  };

  // validate that this schema is valid
  validate() {
    this.traverseSync(this.schema, null, 0, [this.validateSchemaFirstLevelProperties.bind(this), 
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

  // traverse a json object calling provided callbacks according to the right level
  async traverse(obj, parentKey = null, level = 0, callbacks = null) {
    for (var key in obj) {
      //console.log(' '.repeat(2 * (level)) + key + " : " + JSON.stringify(obj[key]));
      
      if (level == 3) {
        throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_TooManyLevels, this.schema));
      }
      else if (!(callbacks[level] === null) && typeof callbacks[level] === 'function') {
        await callbacks[level](key, obj, parentKey);
      }

      if (obj[key] !== null && typeof(obj[key]) == "object" && obj[key].constructor.name != 'ObjectId') {
          //going one step down in the object tree!!
          await this.traverse(obj[key], key, ++level, callbacks);
          level--;
      };
    };
  };

  // validate a json string against this schema
  async validateJson(jsonstr, strict = true) {
    var json;
    if (typeof jsonstr === 'string') {
      try {
        json = Utils.simpleJSONToJSON(jsonstr);
      } catch(err) {
        throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidSchema, schema, err.message));
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
              throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_MissingProp, missingField));
      }
    }

    // 2) if strict invalidate non schema fields
    // 3) validate and sanitize each field
    await this.traverse(json, null, 0, [this.validateField.bind(this), null, null]);
    return json;
  };

  // validate passed JSON fields
  async validateField(key, obj, parentKey) {
    if (!(Object.keys(this.schema).includes(key))) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidProp, key));
    };
    // if this.schema[key] is an object iterate over each schema property for that field and call the corresponding validator
    if (typeof(this.schema[key]) === "object") {
      for (var property in this.schema[key]) {
        if (property != 'required') {
          var validatorName = 'validate_' +  property;
          obj[key] = await this[validatorName](this.schema[key][property], key, obj[key]); // pass object by value so the validator can modify it directly
        }
      }
    }
    // if this.schema[key] is a simple type validate it
    else {
      obj[key] = await this.validate_type(this.schema[key], key, obj[key]);
    }
  }

  validate_type(type, key, val) {
    var typeValidatorName = 'validate_type_' +  type;
    val = this[typeValidatorName](key, val);
    return val;
  }

  validate_type_objectid(key, val) {
    if (val === '') {
      return val;
    }
    if (!(MongoDB.ObjectId.isValid(val))) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, key, val, 'objectid'));
    }
    return MongoDB.ObjectId(val);
  }

  validate_type_embedded_listid(key, val) {
    if (!(MongoDB.ObjectId.isValid(val))) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, key, val, 'embedded_listid'));
    }
    return MongoDB.ObjectId(val);
  }

  validate_type_embedded_itemid(key, val) {
    if (val === '') {
      return val;
    }
    if (!(MongoDB.ObjectId.isValid(val))) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, key, val, 'embedded_itemid'));
    }
    return MongoDB.ObjectId(val);
  }

  validate_type_embedded_itemid_list(key, val) {
    var valArr = val;
    try {
      if (!(valArr instanceof Array)) {
          valArr = valArr.split(/\s*\,\s*/);
      }
      valArr.map(v => {
        this.validate_type_embedded_itemid(key, v);
      });
    } catch(err) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, key, val, 'user_array'));
    }
    return val;
  }

  validate_type_user(key, val) {
    val = val.toLowerCase();
    if (['@all', '@owner'].includes(val)) {
      return val;
    }
    try {
      val = this.validate_type_email(key, val);
    } catch (err) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, key, val, 'user'));
    }
    return val;
  }

  validate_type_user_list(key, val) {
    var valArr = val;
    try {
      if (!(valArr instanceof Array)) {
          valArr = valArr.split(/\s*\,\s*/);
      }
      valArr.map(v => {
        this.validate_type_user(key, v);
      });
    } catch(err) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, key, val, 'user_array'));
    }
    return val.toLowerCase();
  }

  validate_type_string(key, val) {
    if (typeof val !== 'string') {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, key, val, 'string'));
    }
    return val;
  }

   async validate_type_encrypted_string(key, val) {
    if (typeof val !== 'string') {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, key, val, 'encrypted_string'));
    }
    var encryptedStr = await this.validate_encrypt(null, key, val);
    return encryptedStr;
  }

  validate_type_number(key, val) {
    if (typeof val !== 'number') {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, key, val, 'number'));
    }
    return val;
  }

  validate_type_schema(key, val) {
    if (typeof val !== 'string') {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, key, val, 'schema'));
    }
    new ItemSchema(val);
    return val;
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

  validate_upper(type, key, val) {
    return val.toUpperCase();
  }

  validate_lower(type, key, val) {
    return val.toLowerCase();
  }

  async validate_encrypt(type, key, val) {
    var hash =  await bcrypt.hash(val, 10);
    return hash;
  }

  async validate_unique(type, key, val) {
    // search for an identique value
      if (!(this.controler)) {
        throw new Error(Errors.ErrMsg.ItemSchema_NoControler);
      }

      const item = await this.controler.simpleFind(this.listid, {[key]: val});
      
      if (item){
        throw new Error(NodeUtil.format(Errors.ErrMsg.ItemSchema_NotUnique, key, val));
      }

    return val;
  }
};

module.exports = ItemSchema;
