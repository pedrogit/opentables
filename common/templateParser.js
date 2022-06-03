const Globals = require("./globals");

class TemplateParser {
  constructor(template) {
    this.templateStr = template;
  }

  getUsedProperties() {
    const regex = new RegExp("(?<={\\s*)" + Globals.identifierRegEx + "(?=\\s*})", "g");
    return this.templateStr.match(regex);
  }
}

module.exports = TemplateParser
