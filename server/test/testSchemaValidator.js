//var assert = require('assert');
const chai = require("chai");
const NodeUtil = require("util");

const SchemaValidator = require("../src/schemavalidator");
const Errors = require("../../client/src/common/errors");

var expect = chai.expect;

const expectThrowsAsync = async (method, errorMessage) => {
  let error = null;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(error).to.be.an("Error");
  if (errorMessage) {
    expect(error.message).to.equal(errorMessage);
  }
};

describe("1 testSchemaValidator.js List Item Schema", () => {
  it("1.1 Pass null", () => {
    expect(function () {
      new SchemaValidator();
    }).to.throw(Errors.ErrMsg.Schema_Null);
  });

  it("1.2 Pass invalid schema string", () => {
    expect(function () {
      new SchemaValidator("toto");
    }).to.throw(NodeUtil.format(Errors.ErrMsg.Schema_InvalidSchema, '"toto"'));
  });

  it("1.3 Pass a string schema", () => {
    var schemaValidator = new SchemaValidator(
      "prop1: {type: string, required}"
    );
    // just make sure the constructor does not throw
    expect(schemaValidator).to.be.an("object");
  });

  it("1.4 Pass JSON schema", () => {
    var schemaValidator = new SchemaValidator({
      prop1: { type: "string", required: true },
    });
    // just make sure the constructor does not throw
    expect(schemaValidator).to.be.an("object");
  });

  it("1.5 Validate a simple json string against a one level schema", async () => {
    var schemaValidator = new SchemaValidator("prop1: string");
    var result = await schemaValidator.validateJson('{"prop1": "toto"}');
    // just make sure the constructor does not throw
    expect(result).to.be.an("object");
    expect(result).to.have.property("prop1", "toto");
  });

  it("1.6 Test an invalid level one schema parameter", () => {
    var schema = "prop1: upper";
    expect(function () {
      new SchemaValidator(schema);
    }).to.throw(
      NodeUtil.format(Errors.ErrMsg.Schema_InvalidSchema, '"' + schema + '"')
    );
  });

  it("1.7 Validate a string value against a one level schema of type number", async () => {
    var schemaValidator = new SchemaValidator("prop1: number");
    await expectThrowsAsync(
      () => schemaValidator.validateJson('{"prop1": "toto"}'),
      NodeUtil.format(
        Errors.ErrMsg.SchemaValidator_InvalidType,
        "prop1",
        "toto",
        "number"
      )
    );
  });

  it("1.8 Throw an error for an empty required prop, even if default is provided", async () => {
    var schemaValidator = new SchemaValidator('prop1: {type: string, required, default: "default value"}');
    await expectThrowsAsync(
      () => schemaValidator.validateJson('{"prop1": ""}'),
      NodeUtil.format(
        Errors.ErrMsg.SchemaValidator_Required,
        "prop1"
      )
    );
  });

  it("1.9 Generate a required default value", async () => {
    var schemaValidator = new SchemaValidator('prop1: {type: string, required, default: "default value"}');
    var result = await schemaValidator.validateJson('{}');
    // just make sure the constructor does not throw
    expect(result).to.be.an("object");
    expect(result).to.have.property("prop1", "default value");
  });


  it("1.10 Generate a default value for a patched value", async () => {
    var schemaValidator = new SchemaValidator('prop1: {type: string, default: "default value"}');
    var result = await schemaValidator.validateJson('{"prop1": ""}', false);
    // just make sure the constructor does not throw
    expect(result).to.be.an("object");
    expect(result).to.have.property("prop1", "default value");
  });

  it("1.11 Validate a number against a one level schema of type number", async () => {
    var schemaValidator = new SchemaValidator("prop1: number");
    var json = await schemaValidator.validateJson('{"prop1": 123}');

    expect(json).to.be.an("object");
    expect(json).to.have.property("prop1", 123);
  });

  it("1.12 Validate a simple json string against a simple two level schemaa", async () => {
    var schemaValidator = new SchemaValidator("prop1: {type: string}");
    var json = await schemaValidator.validateJson('{"prop1": "toto"}');

    expect(json).to.be.an("object");
    expect(json).to.have.property("prop1", "toto");
  });

  it("1.13 Validate a simple json string against a simple schema", async () => {
    var schemaValidator = new SchemaValidator(
      "prop1: {type: string, required}"
    );
    var json = await schemaValidator.validateJson('{"prop1": "toto"}');

    expect(json).to.be.an("object");
    expect(json).to.have.property("prop1", "toto");
  });

  it("1.14 Validate a missing prop", async () => {
    var schema = "prop1: {type: string, required}";
    var jsonStr = '{"prop": "toto"}';
    var schemaValidator = new SchemaValidator(schema);
    await expectThrowsAsync(
      () => schemaValidator.validateJson(jsonStr),
      NodeUtil.format(Errors.ErrMsg.SchemaValidator_MissingProp, "prop1")
    );
  });

  it("1.15 Valid type", async () => {
    var schemaValidator = new SchemaValidator(
      "{prop1: {type:string, required}}"
    );
    var json = await schemaValidator.validateJson('{"prop1": "toto"}');

    expect(json).to.be.an("object");
    expect(json).to.deep.equal({ prop1: "toto" });
  });

  it("1.16 Invalid type (number instead of string)", async () => {
    var schemaValidator = new SchemaValidator(
      "{prop1: {type:string, required}}"
    );
    await expectThrowsAsync(
      () => schemaValidator.validateJson('{"prop1": 123}'),
      NodeUtil.format(
        Errors.ErrMsg.SchemaValidator_InvalidType,
        "prop1",
        "123",
        "string"
      )
    );
  });

  it("1.17 Validate upper", async () => {
    var schemaValidator = new SchemaValidator(
      "{prop1: {type:string, required, upper}}"
    );
    var json = await schemaValidator.validateJson('{"prop1": "toto"}');

    expect(json).to.be.an("object");
    expect(json).to.deep.equal({ prop1: "TOTO" });
  });

  it("1.18 Invalid email", async () => {
    var schemaValidator = new SchemaValidator("{prop1: email}");
    await expectThrowsAsync(
      () => schemaValidator.validateJson('{"prop1": "aaaa"}'),
      NodeUtil.format(
        Errors.ErrMsg.SchemaValidator_InvalidType,
        "prop1",
        "aaaa",
        "email"
      )
    );
  });

  it("1.19 Valid email", async () => {
    var schemaValidator = new SchemaValidator("{prop1: email}");
    var json = await schemaValidator.validateJson('{"prop1": "Aaaa@x.com"}');

    expect(json).to.be.an("object");
    expect(json).to.deep.equal({ prop1: "aaaa@x.com" });
  });

  it("1.20 Invalid user_array", async () => {
    var schemaValidator = new SchemaValidator("prop1: user_list");
    await expectThrowsAsync(
      () => schemaValidator.validateJson('{"prop1": "aa, bb"}'),
      NodeUtil.format(
        Errors.ErrMsg.SchemaValidator_InvalidType,
        "prop1",
        "aa, bb",
        "user_array"
      )
    );
  });

  it("1.21 Valid user_array", async () => {
    var schemaValidator = new SchemaValidator("prop1: user_list");
    var json = await schemaValidator.validateJson(
      '"prop1": "@All, BB@gmail.com"'
    );

    expect(json).to.be.an("object");
    expect(json).to.deep.equal({ prop1: "@all, bb@gmail.com" });
  });
});
