const MongoDB = require("mongodb");
const NodeUtil = require("util");
const bcrypt = require("bcrypt");

const Globals = require("../../client/src/common/globals");
const Errors = require("../../client/src/common/errors");
const Utils = require("../../client/src/common/utils");
const Schema = require("../../client/src/common/schema");

class SchemaValidator {
  constructor(schema, controler = null, listid = null, post = false) {
    if (schema == null) {
      throw new Error(Errors.ErrMsg.Schema_Null);
    }

    if (
      !Schema.prototype.isPrototypeOf(schema) &&
      (typeof schema === "string" || typeof schema === "object")
    ) {
      this.schema = new Schema(schema);
    } else {
      this.schema = schema;
    }

    if (!Schema.prototype.isPrototypeOf(this.schema)) {
      throw new Error(Errors.ErrMsg.Schema_Malformed);
    }

    if (listid !== null) {
      this.listid = listid;
    }

    if (controler !== null) {
      this.controler = controler;
    }

    if (post !== null) {
      this.post = post;
    }
  }

  reorderTests(tests) {
    var orderedTests = tests;
    if (orderedTests.includes('minlength')) {
      orderedTests = orderedTests.filter(test => test !== 'minlength')
      orderedTests.unshift('minlength');
    }
    return orderedTests;
  }

  // traverse a json object calling provided callbacks according to the right level
  async traverse(obj, parentKey = null, level = 0, callbacks = null) {
    for (var key in obj) {
      //console.log(' '.repeat(2 * (level)) + key + " : " + JSON.stringify(obj[key]));
      if (
        !(callbacks[level] === null) &&
        typeof callbacks[level] === "function"
      ) {
        await callbacks[level](key, obj, parentKey);
      }

      if (
        obj[key] !== null &&
        typeof obj[key] === "object" &&
        obj[key].constructor.name !== "ObjectId"
      ) {
        //going one step down in the object tree!!
        await this.traverse(obj[key], key, ++level, callbacks);
        level--;
      }
    }
  }

  // validate a json string against this schema
  async validateJson(jsonstr, strict = true, user = null) {
    var json;
    if (typeof jsonstr === "string") {
      try {
        json = Utils.simpleJSONToJSON(jsonstr);
      } catch (err) {
        throw new Error(
          NodeUtil.format(Errors.ErrMsg.SchemaValidator_Malformed, err.message)
        );
      }
    } else {
      json = jsonstr;
    }

    // 1) validate all required properties are present if strict
    const jsonkeys = Object.keys(json);
    if (jsonkeys.length === 0) {
      if (strict) {
        // generate default values for all required properties
        json = this.schema.getRequiredDefaults({
          throwIfNoDefault: true,
          user: user
        });
      }
    }
    else {
      if (strict) {
        // check that every required property are provided
        this.schema.getRequired().forEach(key => {
          if (!jsonkeys.includes(key)) {
            throw new Error(
              NodeUtil.format(Errors.ErrMsg.SchemaValidator_MissingProp, key)
            );
          }
        })
      }
      // set a default for each required property
      Object.keys(json).forEach(key => {
        if (this.schema.isRequired(key) && (json[key] === null || json[key] === '')) {
          json[key] = this.schema.getDefault(key, user);
        }
      })
    }

    // 2) if strict invalidate non schema properties
    // 3) validate and sanitize each property
    await this.traverse(json, null, 0, [
      this.validateField.bind(this),
      null,
      null,
    ]);
    return json;
  }

  // validate passed JSON properties
  async validateField(key, obj, parentKey) {
    // do not validate item ids
    if (key !== Globals.itemIdFieldName) {
      if (!Object.keys(this.schema.schema).includes(key)) {
        throw new Error(
          NodeUtil.format(Errors.ErrMsg.SchemaValidator_InvalidProp, key)
        );
      }
      // do not validate empty values
      if (obj[key] !== null && obj[key] !== '') {
        // if this.schema.schema[key] is an object iterate over each schema property for that property and call the corresponding validator
        if (typeof this.schema.schema[key] === "object") {
          var orderedTests = this.reorderTests(Object.keys(this.schema.schema[key]));
          //for (var property in this.schema.schema[key]) {
          //orderedTests.forEach(async test => {
          for (let test of orderedTests) {
            var validatorName = "validate_" + test;

            obj[key] = await this[validatorName](
              this.schema.schema[key][test],
              key,
              obj[key], // pass object by value so the validator can modify it directly
              (obj[Globals.itemIdFieldName] ? obj[Globals.itemIdFieldName] : null)
            );

            // delete properties that were undef by the validator (like hidden ones)
            if (this.post && obj[key] === undefined) {
              delete obj[key];
              break;
            };
          };
              /*
              var validatorName = "validate_" + property;
              obj[key] = await this[validatorName](
                this.schema.schema[key][property],
                key,
                obj[key],
                (obj[Globals.itemIdFieldName] ? obj[Globals.itemIdFieldName] : null)
              ); // pass object by value so the validator can modify it directly
              if (this.post && obj[key] === undefined) {
                delete obj[key];
                break;
              }
          }*/
        }
        // if this.schema.schema[key] is a simple type validate it
        else {
          obj[key] = await this.validate_type(
            this.schema.schema[key],
            key,
            obj[key]
          );
        }
      }
    }
    else {
      obj[key] = await this.validate_type_objectid(
        Globals.itemIdFieldName,
        obj[key]
      );
    }
  }

  validate_type(type, key, val) {
    var typeValidatorName = "validate_type_" + type;
    val = this[typeValidatorName](key, val);
    return val;
  }

  validate_type_objectid(key, val) {
    if (val === "") {
      return val;
    }
    if (!MongoDB.ObjectId.isValid(val)) {
      throw new Error(
        NodeUtil.format(
          Errors.ErrMsg.SchemaValidator_InvalidType,
          key,
          val,
          "objectid"
        )
      );
    }
    return MongoDB.ObjectId(val);
  }

  validate_type_embedded_listid(key, val) {
    // if in post mode, do not validate, just return val
    if (this.post) {
      return val;
    }
    if (!MongoDB.ObjectId.isValid(val)) {
      throw new Error(
        NodeUtil.format(
          Errors.ErrMsg.SchemaValidator_InvalidType,
          key,
          val,
          "embedded_listid"
        )
      );
    }
    return MongoDB.ObjectId(val);
  }

  validate_type_embedded_itemid(key, val) {
    // if in post mode, do not validate, just return val
    if (this.post || val === "") {
      return val;
    }
    if (!MongoDB.ObjectId.isValid(val)) {
      throw new Error(
        NodeUtil.format(
          Errors.ErrMsg.SchemaValidator_InvalidType,
          key,
          val,
          "embedded_itemid"
        )
      );
    }
    return MongoDB.ObjectId(val);
  }

  validate_type_embedded_itemid_list(key, val) {
    // if in post mode, do not validate, just return val
    if (this.post) {
      return val;
    }
    
    var valArr = val;
    try {
      if (!(valArr instanceof Array)) {
        valArr = valArr.split(/\s*\,\s*/);
      }
      valArr.map((v) => {
        this.validate_type_embedded_itemid(key, v);
      });
    } catch (err) {
      throw new Error(
        NodeUtil.format(
          Errors.ErrMsg.SchemaValidator_InvalidType,
          key,
          val,
          "user_array"
        )
      );
    }
    return val;
  }

  validate_type_user(key, val) {
    if (Globals.specialUsers.includes(val.toLowerCase())) {
      return val.toLowerCase();
    }
    if (val.length < 8) {
      throw new Error(
        NodeUtil.format(
          Errors.ErrMsg.SchemaValidator_InvalidType,
          key,
          val,
          "user"
        )
      );
    }
    return val;
  }

  validate_type_user_list(key, val) {
    var valArr = val;
    try {
      if (!(valArr instanceof Array)) {
        valArr = valArr.split(/\s*\,\s*/);
      }
      valArr = valArr.map((v) => this.validate_type_user(key, v));
    } catch (err) {
      throw new Error(
        NodeUtil.format(
          Errors.ErrMsg.SchemaValidator_InvalidType,
          key,
          val,
          "user_list"
        )
      );
    }
    return valArr.join(', ');
  }

  validate_type_string(key, val) {
    if (typeof val !== "string") {
      throw new Error(
        NodeUtil.format(
          Errors.ErrMsg.SchemaValidator_InvalidType,
          key,
          val,
          "string"
        )
      );
    }
    return val;
  }

  validate_type_boolean(key, val) {
    if (typeof val !== "boolean") {
      throw new Error(
        NodeUtil.format(
          Errors.ErrMsg.SchemaValidator_InvalidType,
          key,
          val,
          "boolean"
        )
      );
    }
    return val;
  }

  async validate_type_encrypted_string(key, val) {
    // encrypted strings are hidden by default
    if (this.post) {
      return undefined;
    }
    if (typeof val !== "string") {
      throw new Error(
        NodeUtil.format(
          Errors.ErrMsg.SchemaValidator_InvalidType,
          key,
          val,
          "encrypted_string"
        )
      );
    }
    if (val !== "") {
      var encryptedStr = await this.validate_encrypt(null, key, val);
      return encryptedStr;      
    }
    return val;
  }

  validate_type_number(key, val) {
    if (typeof val !== "number") {
      throw new Error(
        NodeUtil.format(
          Errors.ErrMsg.SchemaValidator_InvalidType,
          key,
          val,
          "number"
        )
      );
    }
    return val;
  }

  validate_type_schema(key, val) {
    if (typeof val !== "string") {
      throw new Error(
        NodeUtil.format(
          Errors.ErrMsg.SchemaValidator_InvalidType,
          key,
          val,
          "schema"
        )
      );
    }
    new Schema(val);
    return val;
  }

  validate_type_template(key, val) {
    if (typeof val !== "string") {
      throw new Error(
        NodeUtil.format(
          Errors.ErrMsg.SchemaValidator_InvalidType,
          key,
          val,
          "template"
        )
      );
    }
    // todo validate JSX template
    return val;
  }

  validate_type_email(key, email) {
    const emailError = new Error(
      NodeUtil.format(
        Errors.ErrMsg.SchemaValidator_InvalidType,
        key,
        email,
        "email"
      )
    );
    var emailRegExp = new RegExp(
      "^[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~](.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*.?[a-zA-Z0-9])*.[a-zA-Z](-?[a-zA-Z0-9])+$"
    );
    if (!email) {
      throw emailError;
    }

    var emailParts = email.split("@");

    if (emailParts.length !== 2) {
      throw emailError;
    }

    var account = emailParts[0];
    var address = emailParts[1];

    if (account.length > 64) {
      throw emailError;
    } else if (address.length > 255) {
      throw emailError;
    }
    var domainParts = address.split(".");
    if (
      domainParts.some(function (part) {
        return part.length > 63;
      })
    ) {
      throw emailError;
    }

    if (!emailRegExp.test(email)) {
      throw emailError;
    }

    return email && email.toLowerCase();
  }

  validate_upper(type, key, val) {
    return val && val.toUpperCase();
  }

  validate_lower(type, key, val) {
    return val && val.toLowerCase();
  }

  async validate_encrypt(type, key, val) {
    // encrypted strings are hidden by default
    if (this.post) {
      return undefined;
    }
    var hash = await bcrypt.hash(val, 10);
    return hash;
  }

  async validate_unique(type, key, val, itemid) {
    // search for an identique value
    if (!this.controler) {
      throw new Error(Errors.ErrMsg.SchemaValidator_NoControler);
    }
    var filter = { [key]: val };
    if (itemid) {
      filter = {
        ...filter,
        [Globals.itemIdFieldName] : {$ne: itemid}
      }
    }
    const item = await this.controler.simpleFind(this.listid, filter);

    if (item) {
      throw new Error(
        NodeUtil.format(Errors.ErrMsg.SchemaValidator_NotUnique, key, val)
      );
    }

    return val;
  }

  validate_required(type, key, val) {
    if (val === undefined || val === null || val === '') {
      throw new Error(
        NodeUtil.format(Errors.ErrMsg.SchemaValidator_Required, key)
      );
    }

    return val;
  }

  validate_default(type, key, val) {
    return val;
  }

  validate_nodefault(type, key, val) {
    return val;
  }

  validate_minlength(length, key, val) {
    if (length && val.trim().length < length) {
      throw new Error(
        NodeUtil.format(Errors.ErrMsg.SchemaValidator_MinLength, key, length)
      );
    }
    return val;
  }

  validate_hidden(type, key, val) {
    if (this.post) {
      return undefined;
    }
    return val;
  }

  validate_options(options_str, key, val) {
    var options = options_str;
    if (typeof options === "string") {
      const optRX = new RegExp(
        Utils.RXStr.singleQuotedStr +
        "|" +
        Utils.RXStr.doubleQuotedStr +
        "|" +
        Utils.RXStr.worldValue, 'g');
      options = options_str.match(optRX);
      options = options.map(opt => Utils.trimFromEdges(opt, '"'));
      options = options.map(opt => Utils.trimFromEdges(opt, "'"));
    }
    if (options === null || options.length < 1) {
      throw new Error(
        NodeUtil.format(Errors.ErrMsg.SchemaValidator_InvalidOption, options_str)
      );
    }
    if (options.includes(val)) {
      return val;
    }
    throw new Error(
      NodeUtil.format(Errors.ErrMsg.SchemaValidator_InvalidOptionValue, val, key, options_str)
    );
  }
}

module.exports = SchemaValidator;
