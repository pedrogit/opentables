const chai = require("chai");
const TemplateParser = require("../templateParser");

const { expect } = chai;

describe("testTemplate.js Test Template object", () => {
  describe("A - Test trimFromEdges()", () => {
    it('1 - Simple test. Default to removing double quotes"', () => {
      const template = new TemplateParser("<A x={yy}>");
      const result = template.getUsedProperties();
      expect(result).to.deep.equal(["yy"]);
    });
  });
});
