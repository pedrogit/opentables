/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
const chai = require("chai");
const Filter = require("../filter");

const { expect } = chai;

describe("testFilter.js List Item Filter", () => {
  it("Pass null", () => {
    const filter = new Filter();
    const finalFilter = filter.final();
    expect(finalFilter).to.be.null;
  });

  it("Test a string filter", () => {
    const filter = new Filter('field1: "aaa"');
    const finalFilter = filter.final();

    expect(finalFilter).to.be.an("object");
    expect(finalFilter).to.have.property("field1", "aaa");
  });

  it("Pass JSON filter", () => {
    const filter = new Filter({ field1: "aaa" });
    const finalFilter = filter.final();

    expect(finalFilter).to.be.an("object");
    expect(finalFilter).to.have.property("field1", "aaa");
  });

  it("Test $contains", () => {
    const filter = new Filter("$contains: [$field1, aaa]");
    const finalFilter = filter.final();

    expect(finalFilter).to.be.an("object");
    expect(finalFilter).to.have.deep.property("$regexFind", {
      input: "$field1",
      regex: "aaa",
    });
  });
});
