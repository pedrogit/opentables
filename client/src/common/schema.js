const NodeUtil = require("util");
const Ajv = require("ajv");

const Globals = require("./globals");
const Errors = require("./errors");
const Utils = require("./utils");

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
  }

  validate() {
    var jsonschema = {
      $defs: {
        onelevel: {
          type: "string",
          enum: [
            "objectid",
            "embedded_listid",
            "embedded_itemid_list",
            "user",
            "user_list",
            "string",
            "encrypted_string",
            "number",
            "schema",
            "email",
            "template",
          ],
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
    return validate(this.schema);
  }

  schemaAsJson() {
    return this.schema;
  }

  getRequired(removeHidden = false) {
    var required = [];
    for (var key in this.schema) {
      if (
        !(removeHidden && key.charAt(0) === "_") &&
        this.schema[key]["required"]
      ) {
        required.push(key);
      }
    }
    return required;
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

  /* // traverse a json object calling provided callbacks according to the right level
  traverseSync(obj, parentKey = null, level = 0, callbacks = null) {
    for (var key in obj) {
      //console.log(' '.repeat(2 * (level)) + key + " : " + JSON.stringify(obj[key]));
      
      if (level === 3) {
        throw new Error(NodeUtil.format(Errors.ErrMsg.Schema_TooManyLevels, this.schema));
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
    var validTypes = ['objectid', 
                      'embedded_listid', 
                      'embedded_itemid', 
                      'embedded_itemid_list',
                      'user',
                      'user_list',
                      'string',
                      'encrypted_string',
                      'number',
                      'schema',
                      'email'];
    if (obj[key] !== null && typeof(obj[key]) !== "object") {
      if (!validTypes.includes(obj[key])) {
        throw new Error(NodeUtil.format(Errors.ErrMsg.Schema_InvalidSchemaParameter, obj[key], key));
      }
    }
  }

  // validate this.schema second level properties
  validateSchemaSecondLevelProperties(key, obj, parentKey) {
    var validKeywords = ['type', 'upper', 'lower', 'encrypt', 'unique', 'required'];
    if (key === 'required') {
      this.requiredProps.push(parentKey);
    }
    else if (!validKeywords.includes(key)) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.Schema_InvalidValue, key, parentKey));
    }
  }

  // traverse a json object calling provided callbacks according to the right level
  async traverse(obj, parentKey = null, level = 0, callbacks = null) {
    for (var key in obj) {
      //console.log(' '.repeat(2 * (level)) + key + " : " + JSON.stringify(obj[key]));
      
      if (level === 3) {
        throw new Error(NodeUtil.format(Errors.ErrMsg.Schema_TooManyLevels, this.schema));
      }
      else if (!(callbacks[level] === null) && typeof callbacks[level] === 'function') {
        await callbacks[level](key, obj, parentKey);
      }

      if (obj[key] !== null && typeof(obj[key]) === "object" && obj[key].constructor.name !== 'ObjectId') {
          //going one step down in the object tree!!
          await this.traverse(obj[key], key, ++level, callbacks);
          level--;
      };
    };
  };
*/
}

module.exports = Schema;
