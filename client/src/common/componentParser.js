const NodeUtil = require('util');
const Ajv = require("ajv")

const Globals = require('./globals');
const Utils = require('./utils');
const Errors = require('./errors');

class ComponentParser {
  constructor(componentStr) {
    try {
      this.component = Utils.simpleJSONToJSON(componentStr);
    } catch(err) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ComponentParser_Invalid, '"[[' + componentStr + ']]"'));
    };
    if (Utils.isObjEmpty(this.component) || !this.validate()) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.ComponentParser_Invalid, '"[[' + componentStr + ']]"'));
    }
    this.targetProp = Object.keys(this.component)[0];
    this.control = (this.component[this.targetProp].hasOwnProperty('control') ? this.component[this.targetProp].control : 'text');
  }

  getTargetProp() {
    return this.targetProp;
  }

  validate() {
    var jsonschema = {
      "$defs": {
        "zerolevel" :{
          "type" : "boolean"
        },
        "onelevel": {
          "type" : "string",
          "enum": ["text", "textarea"]
        }
      },
      "patternProperties": {
        [Globals.identifierRegEx]: {
          "anyOf": [
            {"$ref": "#/$defs/zerolevel"},
            {"$ref": "#/$defs/onelevel"},
              {"type": "object",
                "properties": {
                  "control": {"$ref": "#/$defs/onelevel"},
                  "upper": {"type": "boolean"}, 
                  "lower": {"type": "boolean"}, 
                  "bold" : {"type": "boolean"}
              },            
              "additionalProperties": false
            }
          ]
        }
      }
    };
    var ajv = new Ajv({allErrors: false});
    var validate = ajv.compile(jsonschema);
    var result = validate(this.component);
    return result;
  };
}

/*
 Each componentparser have:
   - a view mode with a double click handler
   - an edit mode with a save and a cancel handler
*/

module.exports = ComponentParser;
