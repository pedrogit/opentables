const chai = require("chai");
const NodeUtil = require("util");

const Errors = require("../errors");
const ComponentParser = require("../componentParser");

var expect = chai.expect;

describe("testComponentParser.js List Item ComponentParser", () => {
  var schema = "prop1: string, prop2: {type: string, required}";

  it("Test an empty string", () => {
    expect(function () {
      new ComponentParser("");
    }).to.throw(
      NodeUtil.format(Errors.ErrMsg.ComponentParser_Invalid, '"[[]]"')
    );
  });

  it("Test a simple property name", () => {
    var componentParser = new ComponentParser("prop3");

    expect(componentParser).to.be.an("object");
    expect(componentParser).to.deep.equal({
      component: { prop3: true },
      targetProp: "prop3",
      control: "text",
    });
  });

  it("Test an invalid property name", () => {
    var cmpStr = "prop2+name";
    expect(function () {
      new ComponentParser(cmpStr);
    }).to.throw(
      NodeUtil.format(
        Errors.ErrMsg.ComponentParser_Invalid,
        '"[[' + cmpStr + ']]"'
      )
    );
  });

  it("Test with a control type", () => {
    var componentParser = new ComponentParser('prop1: {control: "text"}');

    expect(componentParser).to.be.an("object");
    expect(componentParser.component).to.deep.equal({
      prop1: { control: "text" },
    });
    expect(componentParser.targetProp).to.equal("prop1");
    expect(componentParser.control).to.equal("text");
  });

  it("Make sure defining two properties results in invalid", () => {
    var cmpStr = "prop1, prop2";
    expect(function () {
      new ComponentParser(cmpStr);
    }).to.throw(
      NodeUtil.format(
        Errors.ErrMsg.ComponentParser_Invalid,
        '"[[' + cmpStr + ']]"'
      )
    );
  });
});
