const NodeUtil = require("util");
const Ajv = require("ajv");

const Globals = require("./globals");
const Errors = require("./errors");
const SimpleJSON = require("./simpleJSON");

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
        this.schema = SimpleJSON.simpleJSONToJSON(schema);
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

    this.hidden = [];    // properties having the schema hidden property set
    this.reserved = [];  // properties starting with "_"
    this.noDefault = []; // properties having the nodefault schema property set
    this.required = [];  // properties having the required schema property set
    this.embedded = [];  // properties defining an embedded item

    var count = 0;
    var lastKey;
    for (var key in this.schema) {
      // find hidden properties
      if ((this.schema[key]["hidden"] && this.schema[key]["hidden"] === true) || 
          this.schema[key] === "encrypted_string" ||
          this.schema[key]["type"] === "encrypted_string") {
            this.hidden.push(key);
      }

      // find nodefault properties
      if (this.schema[key][Globals.noDefault] && 
          this.schema[key][Globals.noDefault] === true) {
        this.noDefault.push(key);
      }

      // find required properties
      if (this.schema[key]["required"] &&
          this.schema[key]["required"] === true) {
        this.required.push(key);
      }

      // find reserved properties
      if (key.charAt(0) === "_") {
        this.reserved.push(key);
      }

      // find embedded properties
      if (
        this.schema[key] === "embedded_itemid" ||
        this.schema[key] === "embedded_listid" ||
        this.schema[key] === "embedded_itemid_list" ||
        this.schema[key].type === "embedded_itemid" ||
        this.schema[key].type === "embedded_itemid_list"
      ) {
        this.embedded.push(key);
      }
      count++;
      lastKey = key;
    }
    if (count === 1 && this.required.length === 0) {
      if (typeof this.schema[key] === "object") {
        this.schema[key]["required"] = true;
      }
      this.required.push(lastKey);
    }
    if (count > 1 && this.required.length === 0) {
      throw new Error(
                    NodeUtil.format(
                      Errors.ErrMsg.Schema_InvalidSchemaOneRequired,
                        typeof schema === "object"
                          ? JSON.stringify(schema)
                          : '"' + schema + '"'
                    )
                  );
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
                minlength: { type: "integer" },
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
                      minItems: 1
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
      type: "object",
    };
    var ajv = new Ajv({ allErrors: false });
    var validate = ajv.compile(jsonschema);
    var result = validate(this.schema);
    return result;
  }

  schemaAsJson() {
    return this.schema;
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

  getDefault(key, user, listSchemaStr) {
    if (this.schema.hasOwnProperty(key)) {
      if (this.schema[key].hasOwnProperty('nodefault')) {
        return '';
      }
      if (this.schema[key].hasOwnProperty('default')) {
        return this.schema[key]['default'];
      }

      var propType = this.getType(key);
      
      if (propType === 'template')
      {
        if (listSchemaStr) {
          return this.getDefaultTemplate({listSchema: (new Schema(listSchemaStr))});
        }
        else {
          return '';
        }
      }

      if (propType === 'schema') return 'prop1: "string"';
      if (propType === 'number') return 0;
      if (propType === 'email') return "email@gmail.com";
      if (propType === 'user' || propType === 'user_list') return user;
      return key;
    }

    return null;
  }

  static deleteEmptyProps(item) {
    var props = Object.keys(item)
    props.forEach(p => {
      if (item[p] === "") {
        delete item[p];
      }
    });
    return item;
  }

  static getEmptyProps(item) {
    var props = Object.keys(item)
    return props.filter(p => item[p] === null || item[p] === "");
  }

  getDefaultTemplate({
    hidden = false, 
    reserved = false,
    listSchema = null
  } = {}) {
    var schema = listSchema ? listSchema : this;
    return schema.getProps({
      hidden: hidden, 
      reserved: reserved
    })
    .map((prop) => {
      if (schema.hasProperty(prop, "options")) {
        return ("<Select val={" + prop + "} options={['" + schema.getProperty(prop, "options").join("', '") + "']} inline /> ")
      }
      if (schema.getType(prop) === 'encrypted_string') {
        return ("<Password val={" + prop + "} inline /> ")
      }
      return ("<Text val={" + prop + "} inline /> ")
    })
    .join("");
  }

  getRequiredDefaults({
    throwIfNoDefault = false, 
    user,
    listSchema
  } = {}) {
    return this.getAllDefaults({
      hidden: false,
      reserved: false,
      others: false,
      throwIfNoDefault: throwIfNoDefault, 
      user: user,
      listSchema: listSchema
    })
  }

  getAllDefaults({
    required = true,
    hidden = true,
    reserved = true,
    others = true,
    throwIfNoDefault = false, 
    user,
    listSchema
  } = {}) {
    var def = {};
    if (throwIfNoDefault && this.noDefault.length !== 0) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.SchemaValidator_NoDefault, this.noDefault.join(', ')));
    }

    this.getProps({
      required: required,
      hidden: hidden,
      reserved: reserved,
      others: others
    }).forEach((key) => {
      def[key] = this.getDefault(key, user, listSchema);
    })
    return def;
  }

  getEmbedded() {
    return this.embedded;
  }

  getProps({
      required = true,
      hidden = true,
      reserved = true,
      others = true,
  } = {}) {
    return this.filterProps(Object.keys(this.schema), {
      required: required,
      hidden: hidden,
      reserved: reserved,
      others: others
    })
  }

  filterProps(
    props,
    {
      required = true,
      hidden = true,
      reserved = true,
      others = true,
    } = {}
  ) {
    var allProps = Object.keys(this.schema);
    if (others) {
      if (!required) {
        allProps = allProps.filter(p => !(this.required.includes(p)));
      }
      if (!hidden) {
        allProps = allProps.filter(p => !(this.hidden.includes(p)));
      }
      if (!reserved) {
        allProps = allProps.filter(p => !(this.reserved.includes(p)));
      }
    }
    else {
      allProps = [];
      if (required) {
        allProps = this.required;
      }
      if (hidden) {
        allProps = allProps.concat(this.hidden);
      }
      if (reserved) {
        allProps = allProps.concat(this.reserved);
      }
    }
    return allProps.filter(p => props.includes(p));;
  }

  isRequired(prop) {
    return this.required.includes(prop);
  }

  getRequired() {
    return this.required
  }

  getOptional() {
    return this.getProps({
      required: false
    });
  }

  getHidden() {
    return this.hidden;
  }

  getNotHidden() {
    return this.getProps({
      hidden: false
    });
  }

  getReserved() {
    return this.hidden;
  }

  getNotReserved() {
    return this.getProps({
      reserved: false
    });
  }

  getUnsetProps(
    item,
    {
      hidden = false,
      reserved = false
    } = {}
  ) {
    return this.getProps({hidden: hidden, reserved: reserved}).filter(key => item[key] === undefined);
  }

  hasProperty(key, property) {
    return this.schema.hasOwnProperty(key) && 
           this.schema[key].hasOwnProperty(property);
  }

  getProperty(key, property) {
    return this.schema.hasOwnProperty(key) && 
           this.schema[key][property];
  }
}

module.exports = Schema;
