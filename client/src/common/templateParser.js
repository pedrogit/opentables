const NodeUtil = require("util");

const Errors = require("./errors");
const Schema = require("./schema");
const ComponentParser = require("./componentParser");

const componentRE = new RegExp("\\[\\[(.+?)\\]\\]", "g");

class TemplateParser {
  constructor(template, schema = null) {
    this.template = template.toString();
    if (typeof schema === "string") {
      this.schema = new Schema(schema);
    } else {
      this.schema = schema;
    }

    if (!this.template || this.template === "") {
      this.setDefTemplate();
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
    // for now only validate componentParser json strings
    for (const componentStr of this.template.matchAll(componentRE)) {
      var componentParser = new ComponentParser(componentStr[1]);
      if (
        this.schema &&
        !this.schema.getProps().includes(componentParser.getTargetProp())
      ) {
        throw new Error(
          NodeUtil.format(
            Errors.ErrMsg.ComponentParser_Invalid,
            '"[[' + componentStr[1] + ']]"'
          )
        );
      }
    }
    return true;
  }

  // generate a default template exclusively with required properties
  setDefTemplate() {
    this.template = "";
    if (this.schema) {
      this.template = this.schema
        .getRequired()
        .map((prop) => "[[" + prop + ": {control: text}]]")
        .join();
    }
  }
}

module.exports = TemplateParser;
