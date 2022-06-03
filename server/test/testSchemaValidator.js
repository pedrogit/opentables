//var assert = require('assert');
const chai = require("chai");
const NodeUtil = require("util");

const SchemaValidator = require("../src/schemavalidator");
const Errors = require("../../common/errors");
const { stringify } = require("ajv");
const Globals = require("../../common/globals");

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

describe("1 testSchemaValidator.js test schema constructor", () => {
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
    expect(schemaValidator).to.deep.equal({
      post: false, 
      schema: {
        required: ["prop1"], 
        hidden: [], 
        embedded: [], 
        reserved: [], 
        noDefault: [], 
        schema: {
          prop1: {
            type: "string", 
            required: true
          }
        }
      }
    });
  });

  it("1.4 Pass JSON schema", () => {
    var schemaValidator = new SchemaValidator({
      prop1: { type: "string", required: true },
    });
    // just make sure the constructor does not throw
    expect(schemaValidator).to.be.an("object");
    expect(schemaValidator).to.deep.equal({
      post: false, 
      schema: {
        required: ["prop1"], 
        hidden: [], 
        embedded: [], 
        reserved: [], 
        noDefault: [], 
        schema: {
          prop1: {
            type: "string", 
            required: true
          }
        }
      }
    });
  });

  it("1.5 Test an invalid level one schema parameter", () => {
    var schema = "prop1: upper";
    expect(function () {
      new SchemaValidator(schema);
    }).to.throw(
      NodeUtil.format(Errors.ErrMsg.Schema_InvalidSchema, '"' + schema + '"')
    );
  });

  it("1.6 Valid string with options as a string list", async () => {
    var schemaValidator = new SchemaValidator("prop1: {type: string, options: \"a, b, c\"}");
    // just make sure the constructor does not throw
    expect(schemaValidator).to.be.an("object");
    expect(schemaValidator).to.deep.equal({
      post: false, 
      schema: {
        required: ["prop1"], 
        hidden: [], 
        embedded: [], 
        reserved: [], 
        noDefault: [], 
        schema: {
          prop1: {
            type: "string", 
            required: true,
            options: "a, b, c"
          }
        }
      }
    });
  });

  it("1.7 Valid string with options as a string list", async () => {
    var schemaValidator = new SchemaValidator("prop1: {type: string, required, options: [a_a, b_b, c_c]}");
    // just make sure the constructor does not throw
    expect(schemaValidator).to.be.an("object");
    expect(schemaValidator).to.deep.equal({
      post: false, 
      schema: {
        required: ["prop1"], 
        hidden: [], 
        embedded: [], 
        reserved: [], 
        noDefault: [],
        schema: {
          prop1: {
            type: "string", 
            required: true,
            options: ["a_a", "b_b", "c_c"]
          }
        }
      }
    });
  });

  it("1.8 Empty options", async () => {
    var schema = "prop1: {type: string, options: \"\"}";
    expect(function () {
      new SchemaValidator(schema);
    }).to.throw(
      NodeUtil.format(Errors.ErrMsg.Schema_InvalidSchema, '"' + schema + '"')
    );
  });

  it("1.9 Complex schema", async () => {
    var schema = "{name: {type: string, required, default: 'List name'}, owner: {type: user, required}, r_permissions: {type: user_list, lower, default: @all}, rw_permissions: {type: user_list, lower, default: @owner}, item_r_permissions: {type: user_list, lower, default: @all}, item_rw_permissions: {type: user_list, lower, default: @owner}, " + Globals.listSchemaFieldName + ": {type: schema, default: 'prop1: string'}}";
    var schemaValidator = new SchemaValidator(schema);
    
    expect(schemaValidator).to.be.an("object");
    expect(schemaValidator).to.deep.equal({
      post: false, 
      schema: {
        required: ["name", "owner"], 
        hidden: [], 
        embedded: [], 
        reserved: [], 
        noDefault: [],
        schema: {
          [Globals.nameFieldName]: {
            type: "string",
            required: true,
            default: "List name",
          },
          [Globals.ownerFieldName]: {
            type: "user",
            required: true,
          },
          [Globals.readPermFieldName]: {
            type: "user_list",
            lower: true,
            default: "@all",
          },
          [Globals.readWritePermFieldName]: {
            type: "user_list",
            lower: true,
            default: "@owner",
          },
          [Globals.itemReadPermFieldName]: {
            type: "user_list",
            lower: true,
            default: "@all",
          },
          [Globals.itemReadWritePermFieldName]: {
            type: "user_list",
            lower: true,
            default: "@owner",
          },
          [Globals.listSchemaFieldName]: {
            type: "schema",
            default: "prop1: string",
          },
        },
      },
    });
  });
});

describe("2 testSchemaValidator.js test string against schema", () => {

  it("2.5 Validate a simple json string against a one level schema", async () => {
    var schemaValidator = new SchemaValidator("prop1: string");
    var result = await schemaValidator.validateJson('{"prop1": "toto"}');
    // just make sure the constructor does not throw
    expect(result).to.be.an("object");
    expect(result).to.have.property("prop1", "toto");
  });



  it("2.1 Validate a string value against a one level schema of type number", async () => {
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

  it("2.2 Throw an error for an empty required prop, even if default is provided", async () => {
    var schemaValidator = new SchemaValidator('prop1: {type: string, required, default: "default value"}');
    var result = await schemaValidator.validateJson('{"prop1": ""}');
    // just make sure the constructor does not throw
    expect(result).to.be.an("object");
    expect(result).to.have.property("prop1", "default value");
  });

  it("2.3 Generate a required default value", async () => {
    var schemaValidator = new SchemaValidator('prop1: {type: string, required, default: "default value"}');
    var result = await schemaValidator.validateJson('{}');
    // just make sure the constructor does not throw
    expect(result).to.be.an("object");
    expect(result).to.have.property("prop1", "default value");
  });

  it("2.4 Make sure a default value is not generated for an optional value", async () => {
    var schemaValidator = new SchemaValidator('prop1: {type: string, required}, prop2: {type: string, default: "default value"}');
    var result = await schemaValidator.validateJson('{"prop2": ""}', false);
    // just make sure the constructor does not throw
    expect(result).to.be.an("object");
    expect(result).to.have.property("prop2", "");
  });

  it("2.5 Validate a number against a one level schema of type number", async () => {
    var schemaValidator = new SchemaValidator("prop1: number");
    var json = await schemaValidator.validateJson('{"prop1": 123}');

    expect(json).to.be.an("object");
    expect(json).to.have.property("prop1", 123);
  });

  it("2.6 Validate a simple json string against a simple two level schemaa", async () => {
    var schemaValidator = new SchemaValidator("prop1: {type: string}");
    var json = await schemaValidator.validateJson('{"prop1": "toto"}');

    expect(json).to.be.an("object");
    expect(json).to.have.property("prop1", "toto");
  });

  it("2.7 Validate a simple json string against a simple schema", async () => {
    var schemaValidator = new SchemaValidator(
      "prop1: {type: string, required}"
    );
    var json = await schemaValidator.validateJson('{"prop1": "toto"}');

    expect(json).to.be.an("object");
    expect(json).to.have.property("prop1", "toto");
  });

  it("2.8 Validate a missing prop", async () => {
    var schema = "prop1: {type: string, required}";
    var jsonStr = '{"prop": "toto"}';
    var schemaValidator = new SchemaValidator(schema);
    await expectThrowsAsync(
      () => schemaValidator.validateJson(jsonStr),
      NodeUtil.format(Errors.ErrMsg.SchemaValidator_MissingProp, "prop1")
    );
  });

  it("2.9 Valid type", async () => {
    var schemaValidator = new SchemaValidator(
      "{prop1: {type:string, required}}"
    );
    var json = await schemaValidator.validateJson('{"prop1": "toto"}');

    expect(json).to.be.an("object");
    expect(json).to.deep.equal({ prop1: "toto" });
  });

  it("2.10 Invalid type (number instead of string)", async () => {
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

  it("2.11 Validate upper", async () => {
    var schemaValidator = new SchemaValidator(
      "{prop1: {type:string, required, upper}}"
    );
    var json = await schemaValidator.validateJson('{"prop1": "toto"}');

    expect(json).to.be.an("object");
    expect(json).to.deep.equal({ prop1: "TOTO" });
  });

  it("2.12 Invalid email", async () => {
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

  it("2.13 Valid email", async () => {
    var schemaValidator = new SchemaValidator("{prop1: email}");
    var json = await schemaValidator.validateJson('{"prop1": "Aaaa@x.com"}');

    expect(json).to.be.an("object");
    expect(json).to.deep.equal({ prop1: "aaaa@x.com" });
  });

  it("2.14 Invalid user_list", async () => {
    var schemaValidator = new SchemaValidator("prop1: user_list");
    await expectThrowsAsync(
      () => schemaValidator.validateJson('{"prop1": "aa, bb"}'),
      NodeUtil.format(
        Errors.ErrMsg.SchemaValidator_InvalidType,
        "prop1",
        "aa, bb",
        "user_list"
      )
    );
  });

  it("2.15 Valid user_list", async () => {
    var schemaValidator = new SchemaValidator("prop1: user_list");
    var json = await schemaValidator.validateJson('"prop1": "@All, First User"');

    expect(json).to.be.an("object");
    expect(json).to.deep.equal({ prop1: "@all, First User" });
  });

  it("2.16 Valid boolean", async () => {
    var schemaValidator = new SchemaValidator("prop1: boolean");
    var json = await schemaValidator.validateJson('"prop1": true');

    expect(json).to.be.an("object");
    expect(json).to.deep.equal({ prop1: true });
  });

  it("2.17 Valid string for option string", async () => {
    var schemaValidator = new SchemaValidator("prop1: {type: string, options: \"abc, d, efg\"}");
    var json = await schemaValidator.validateJson('"prop1": abc');

    expect(json).to.be.an("object");
    expect(json).to.deep.equal({ prop1: "abc" });
  });

  it("2.17.1 Valid string for option array", async () => {
    var schemaValidator = new SchemaValidator("prop1: {type: string, options: [abc, d, efg]}");
    var json = await schemaValidator.validateJson('"prop1": abc');

    expect(json).to.be.an("object");
    expect(json).to.deep.equal({ prop1: "abc" });
  });

  it("2.18 Valid string for option string", async () => {
    var schemaValidator = new SchemaValidator("prop1: {type: string, options: \"a, b, c\"}");
    var json = await schemaValidator.validateJson('"prop1": b');

    expect(json).to.be.an("object");
    expect(json).to.deep.equal({ prop1: "b" });
  });

  it("2.18.1 Valid string for option array", async () => {
    var schemaValidator = new SchemaValidator("prop1: {type: string, options: [a, b, c]}");
    var json = await schemaValidator.validateJson('"prop1": b');

    expect(json).to.be.an("object");
    expect(json).to.deep.equal({ prop1: "b" });
  });


  it("2.19 Valid string for option string", async () => {
    var schemaValidator = new SchemaValidator("prop1: {type: string, options: \"abc, d, efg\"}");
    var json = await schemaValidator.validateJson('"prop1": efg');

    expect(json).to.be.an("object");
    expect(json).to.deep.equal({ prop1: "efg" });
  });

  it("2.19.1 Valid string for option array", async () => {
    var schemaValidator = new SchemaValidator("prop1: {type: string, options: [abc, d, efg]}");
    var json = await schemaValidator.validateJson('"prop1": efg');

    expect(json).to.be.an("object");
    expect(json).to.deep.equal({ prop1: "efg" });
  });

  it("2.20 Invalid string with options", async () => {
    var schemaValidator = new SchemaValidator("prop1: {type: string, options: \"a, b, c\"}");
    expect(schemaValidator).to.be.an("object");
    await expectThrowsAsync(
      () => schemaValidator.validateJson('{"prop1": d}'),
      NodeUtil.format(Errors.ErrMsg.SchemaValidator_InvalidOptionValue, "d", "prop1", "a, b, c")
    ); 
  });

  it("2.21 Space separated options", async () => {
    var schemaValidator = new SchemaValidator("prop1: {type: string, options: \"a b\"}");
    expect(schemaValidator).to.be.an("object");

    var json = await schemaValidator.validateJson('"prop1": b');
    expect(json).to.deep.equal({ prop1: "b" });
  });

  it("2.22 Array options including spaces", async () => {
    var schemaValidator = new SchemaValidator("prop1: {type: string, options: [\"a a\", bb]}");
    expect(schemaValidator).to.be.an("object");

    var json = await schemaValidator.validateJson('"prop1": "a a"');
    expect(json).to.deep.equal({ prop1: "a a" });
  });

  it("2.23 String options including spaces", async () => {
    var schemaValidator = new SchemaValidator("prop1: {type: string, options: \"'a a', 'b b', 'c c'\"}");
    expect(schemaValidator).to.be.an("object");

    var json = await schemaValidator.validateJson('"prop1": "c c"');
    expect(json).to.deep.equal({ prop1: "c c" });
  });

  it("2.24 String minlength", async () => {
    var schemaValidator = new SchemaValidator("prop1: {type: string, minlength: 8}");
    expect(schemaValidator).to.be.an("object");

    await expectThrowsAsync(
      () => schemaValidator.validateJson('{"prop1": xxx}'),
      NodeUtil.format(Errors.ErrMsg.SchemaValidator_MinLength, 'prop1', 8)
    );

    var json = await schemaValidator.validateJson('"prop1": "yyyyyyyy"');
    expect(json).to.deep.equal({ prop1: "yyyyyyyy" });
  });

  it("2.25 String minlength for encrypted_string", async () => {
    var schemaValidator = new SchemaValidator("prop1: {type: encrypted_string, minlength: 8}");
    expect(schemaValidator).to.be.an("object");

    await expectThrowsAsync(
      () => schemaValidator.validateJson('{"prop1": xxx}'),
      NodeUtil.format(Errors.ErrMsg.SchemaValidator_MinLength, 'prop1', 8)
    );

    var json = await schemaValidator.validateJson('"prop1": "yyyyyyyy"');
    expect(json.prop1.length).to.equal(60);
  });
});
