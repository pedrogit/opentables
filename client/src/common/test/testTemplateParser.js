const chai = require("chai");
const NodeUtil = require("util");

const Errors = require("../errors");
const TemplateParser = require("../templateParser");

var expect = chai.expect;

describe("testTemplateParser.js List Item TemplateParser", () => {
  var schema = "prop1: string, prop2: {type: string, required}";

  it("Test an empty string", () => {
    var templateParser = new TemplateParser("", schema);

    expect(templateParser).to.be.an("object");
    expect(templateParser.template).to.equal("[[prop2: {control: text}]]");
  });

  it("Test a non existing property", () => {
    var tmpStr = "[[prop3]]";

    expect(function () {
      new TemplateParser(tmpStr, schema);
    }).to.throw(
      NodeUtil.format(Errors.ErrMsg.ComponentParser_Invalid, '"' + tmpStr + '"')
    );
  });

  it("Test a more complex TemplateParser", () => {
    var tmpStr = '<a src="[[prop1]]">[[prop2]]</a>';
    var templateParser = new TemplateParser(tmpStr, schema);

    expect(templateParser).to.be.an("object");
    expect(templateParser.template).to.equal(tmpStr);
  });

  it("Test an invalid TemplateParser", () => {
    var componentStr = "prop1: {xxx}";
    var template = '<img src="[[' + componentStr + ']]">';
    expect(function () {
      new TemplateParser(template, schema);
    }).to.throw(
      NodeUtil.format(
        Errors.ErrMsg.ComponentParser_Invalid,
        '"[[' + componentStr + ']]"'
      )
    );
  });
});
