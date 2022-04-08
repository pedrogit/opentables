//import Template from
const chai = require("chai");
const TemplateParser = require("../templateParser");

var expect = chai.expect;

describe("testTemplate.js Test Template object", () => {
  describe("A - Test trimFromEdges()", () => {
    it('1 - Simple test. Default to removing double quotes"', () => {
      var template = new TemplateParser("<A x={yy}>");
      var result = template.getUsedProperties();
      expect(result).to.deep.equal(["yy"]);
    });
  });

});
