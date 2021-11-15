const NodeUtil = require('util');
const Ajv = require("ajv")

const Globals = require('./common/globals');
const Utils = require('./common/utils');
const Errors = require('./common/errors');

class Component {
  constructor(componentStr) {
    try {
      this.component = Utils.simpleJSONToJSON(componentStr);
    } catch(err) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.Component_Invalid, '"[[' + componentStr + ']]"'));
    };
    if (Utils.isObjEmpty(this.component) || !this.validate()) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.Component_Invalid, '"[[' + componentStr + ']]"'));
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

  render(values) {
    var result = values[this.targetProp] === undefined ? '' : values[this.targetProp];
    return result;
  }
}

module.exports = Component;
