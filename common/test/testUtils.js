const chai = require("chai");
const Utils = require("../commonUtils");

const { expect } = chai;

describe("commonUtils.js Test Common Utils functions", () => {
  describe("M - Test objWithout()", () => {
    it("Simple test with without as a string", () => {
      const result = Utils.objWithout({ a: 1, b: 2 }, "b");
      expect(result).to.deep.equal({ a: 1 });
    });

    it("Simple test with without as an array", () => {
      const result = Utils.objWithout({ a: 1, b: 2, c: 3 }, ["a", "c"]);
      expect(result).to.deep.equal({ b: 2 });
    });

    it("Simple that object is deeply copied", () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const result = Utils.objWithout(obj1, ["a", "c"]);
      expect(result).to.deep.equal({ b: 2 });
      expect(obj1).to.deep.equal(obj1);
    });
  });
});
