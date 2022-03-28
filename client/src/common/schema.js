const NodeUtil = require("util");
const Ajv = require("ajv");

const Globals = require("./globals");
const Errors = require("./errors");
const Utils = require("./utils");

const validTypes = [
  "objectid",
  "embedded_listid",
  "embedded_itemid_list",
  "user",
  "user_list",
  "string",
  "boolean",
  "encrypted_string",
  "number",
  "schema",
  "email",
  "template",
];

class Schema {
  constructor(schema) {
    if (schema == null) {
      throw new Error(Errors.ErrMsg.Schema_Null);
    }
    if (typeof schema === "string") {
      try {
        this.schema = Utils.simpleJSONToJSON(schema);
      } catch (err) {
        throw new Error(
          NodeUtil.format(
            Errors.ErrMsg.Schema_InvalidSchema,
            schema,
            err.message
          )
        );
      }
    } else {
      this.schema = schema;
    }

    if (typeof this.schema !== "object") {
      throw new Error(Errors.ErrMsg.Schema_Malformed);
    }

    if (!this.validate()) {
      throw new Error(
        NodeUtil.format(
          Errors.ErrMsg.Schema_InvalidSchema,
          typeof schema === "object"
            ? JSON.stringify(schema)
            : '"' + schema + '"'
        )
      );
    }

    this.hidden = [];
    this.noDefault = [];
    this.required = [];
    for (var key in this.schema) {
      if ((this.schema[key]["hidden"] && this.schema[key]["hidden"] === true) || 
          this.schema[key] === "encrypted_string" ||
          this.schema[key]["type"] === "encrypted_string") {
            this.hidden.push(key);
      }
      if (this.schema[key][Globals.noDefault] && 
          this.schema[key][Globals.noDefault] === true) {
        this.noDefault.push(key);
      }
      if (this.schema[key]["required"] &&
          this.schema[key]["required"] === true) {
        this.required.push(key);
      }
    }
  }

  validate() {
    var jsonschema = {
      $defs: {
        onelevel: {
          type: "string",
          enum: validTypes,
        },
      },
      patternProperties: {
        [Globals.identifierRegEx]: {
          anyOf: [
            { $ref: "#/$defs/onelevel" },
            {
              type: "object",
              properties: {
                type: { $ref: "#/$defs/onelevel" },
                upper: { type: "boolean" },
                lower: { type: "boolean" },
                encrypt: { type: "boolean" },
                unique: { type: "boolean" },
                required: { type: "boolean" },
                hidden: { type: "boolean" },
                [Globals.noDefault]: { type: "boolean" },
                options: {
                  anyOf: [
                    { type: "string",
                      minLength: 1
                    }, 
                    { type: "array", 
                      items: {
                        type: "string",
                        minLength: 1
                      },
                      minLength: 1
                    }
                  ]
                },
                default: {
                  anyOf: [
                    { type: "string" }, 
                    { type: "boolean" }
                  ]
                }
              },
              additionalProperties: false,
            },
          ],
        },
      },
      additionalProperties: false,
    };
    var ajv = new Ajv({ allErrors: false });
    var validate = ajv.compile(jsonschema);
    var result = validate(this.schema);
    return result;
  }

  schemaAsJson() {
    return this.schema;
  }

  getRequired(
    removeReserved = false,
    removeHidden = false
) {

    return this.required.filter(prop => {
      return !(removeReserved && prop.charAt(0) === "_") &&
             !(removeHidden && this.hidden.includes(prop));
    })
  }

  getHidden() {
    return this.hidden;
  }

  getType(key) {
    if (this.schema.hasOwnProperty(key)) {
      if (validTypes.includes(this.schema[key])) {
        return this.schema[key];
      }
      if (this.schema[key].hasOwnProperty('type') &&
          validTypes.includes(this.schema[key]['type'])) {
       return this.schema[key]['type'];
      }
      return 'text'
    } 
    return null;
  }

  getDefault(key, user) {
    if (this.schema.hasOwnProperty(key)) {
      if (this.schema[key].hasOwnProperty('nodefault')) {
        return '';
      }
      if (this.schema[key].hasOwnProperty('default')) {
        return this.schema[key]['default'];
      }

      var propType = this.getType(key);
      
      if (propType === 'template') return '';
      if (propType === 'schema') return 'prop1: "string"';
      if (propType === 'number') return 0;
      if (propType === 'email') return "email@gmail.com";
      if (propType === 'user' || propType === 'user_list') return user;
      return key;
    }

    return null;
  }

  getAllDefault({
    onlyRequired = false,
    throwIfNoDefault = false, 
    user
  }
  ) {
    var def = {};
    if (throwIfNoDefault && this.noDefault.length !== 0) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.SchemaValidator_NoDefault, this.noDefault.join(', ')));
    }

    (onlyRequired ? this.getRequired() : this.getProps()).forEach((key) => {
      def[key] = this.getDefault(key, user);
    })
    return def;
  }

  getEmbeddedItems() {
    var embItems = [];
    for (var key in this.schema) {
      if (
        this.schema[key] === "embedded_itemid" ||
        this.schema[key] === "embedded_listid" ||
        this.schema[key] === "embedded_itemid_list"
      ) {
        var item = {};
        item.type = this.schema[key];
        embItems.push({ [key]: item });
      } else if (
        this.schema[key].type === "embedded_itemid" ||
        this.schema[key].type === "embedded_itemid_list"
      ) {
        embItems.push({ [key]: this.schema[key] });
      }
    }

    return embItems;
  }

  getProps() {
    return Object.keys(this.schema);
  }
}

module.exports = Schema;
