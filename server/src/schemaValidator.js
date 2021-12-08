const MongoDB = require("mongodb");
const NodeUtil = require("util");
const bcrypt = require("bcrypt");

const Globals = require("../../client/src/common/globals");
const Errors = require("../../client/src/common/errors");
const Utils = require("../../client/src/common/utils");
const Schema = require("../../client/src/common/schema");

class SchemaValidator {
  constructor(schema, controler = null, listid = null) {
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
        typeof obj[key] == "object" &&
        obj[key].constructor.name != "ObjectId"
      ) {
        //going one step down in the object tree!!
        await this.traverse(obj[key], key, ++level, callbacks);
        level--;
      }
    }
  }

  // validate a json string against this schema
  async validateJson(jsonstr, strict = true) {
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

    // 1) validate all required fields are present if strict
    if (strict) {
      const jsonkeys = Object.keys(json);
      //console.log(jsonkeys);
      var missingField = "";
      if (
        !(jsonkeys === null) &&
        !(jsonkeys.length === 0) &&
        !this.schema.getRequired().every((field) => {
          var inc = jsonkeys.includes(field);
          if (!inc) {
            missingField = field;
          }
          return inc;
        })
      ) {
        throw new Error(
          NodeUtil.format(
            Errors.ErrMsg.SchemaValidator_MissingProp,
            missingField
          )
        );
      }
    }

    // 2) if strict invalidate non schema fields
    // 3) validate and sanitize each field
    await this.traverse(json, null, 0, [
      this.validateField.bind(this),
      null,
      null,
    ]);
    return json;
  }

  // validate passed JSON fields
  async validateField(key, obj, parentKey) {
    if (!Object.keys(this.schema.schema).includes(key)) {
      throw new Error(
        NodeUtil.format(Errors.ErrMsg.SchemaValidator_InvalidProp, key)
      );
    }
    // if this.schema.schema[key] is an object iterate over each schema property for that field and call the corresponding validator
    if (typeof this.schema.schema[key] === "object") {
      for (var property in this.schema.schema[key]) {
        if (property != "required") {
          var validatorName = "validate_" + property;
          obj[key] = await this[validatorName](
            this.schema.schema[key][property],
            key,
            obj[key]
          ); // pass object by value so the validator can modify it directly
        }
      }
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
    if (val === "") {
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
    val = val.toLowerCase();
    if (["@all", "@owner"].includes(val)) {
      return val;
    }
    try {
      val = this.validate_type_email(key, val);
    } catch (err) {
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
      valArr.map((v) => {
        this.validate_type_user(key, v);
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
    return val.toLowerCase();
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

  async validate_type_encrypted_string(key, val) {
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
    var encryptedStr = await this.validate_encrypt(null, key, val);
    return encryptedStr;
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
          "TemplateParser"
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

    return email.toLowerCase();
  }

  validate_upper(type, key, val) {
    return val.toUpperCase();
  }

  validate_lower(type, key, val) {
    return val.toLowerCase();
  }

  async validate_encrypt(type, key, val) {
    var hash = await bcrypt.hash(val, 10);
    return hash;
  }

  async validate_unique(type, key, val) {
    // search for an identique value
    if (!this.controler) {
      throw new Error(Errors.ErrMsg.SchemaValidator_NoControler);
    }

    const item = await this.controler.simpleFind(this.listid, { [key]: val });

    if (item) {
      throw new Error(
        NodeUtil.format(Errors.ErrMsg.SchemaValidator_NotUnique, key, val)
      );
    }

    return val;
  }
}

module.exports = SchemaValidator;
