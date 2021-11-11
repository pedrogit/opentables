//var assert = require('assert');
const chai = require('chai');
const NodeUtil = require('util');

const SchemaValidator = require('../schemavalidator');
const Errors = require('../../client/src/common/errors');

var expect = chai.expect;

const expectThrowsAsync = async (method, errorMessage) => {
  let error = null
  try {
    await method()
  }
  catch (err) {
    error = err
  }
  expect(error).to.be.an('Error');
  if (errorMessage) {
    expect(error.message).to.equal(errorMessage);
  }
}

describe('1 testSchemaValidator.js List Item Schema', () => {
  it('1.1 Pass null', () => {
    expect(function(){new SchemaValidator();}).to.throw(Errors.ErrMsg.Schema_Null);
  });

  it('1.2 Pass invalid schema string', () => {
    expect(function(){new SchemaValidator('toto');}).to.throw(NodeUtil.format(Errors.ErrMsg.Schema_InvalidSchema, 'toto', 'Unexpected token } in JSON at position 7'));
  });

  it('1.3 Pass a string schema', () => {
    var schemaValidator = new SchemaValidator('field1: {type: string, required}');
    // just make sure the constructor does not throw
    expect(schemaValidator).to.be.an('object');
  });

  it('1.4 Pass JSON schema', () => {
    var schemaValidator = new SchemaValidator({field1: {type: 'string', required: true}});
    // just make sure the constructor does not throw
    expect(schemaValidator).to.be.an('object');
  });

  it('1.5 Validate a simple json string against a one level schema', async () => {
    var schemaValidator = new SchemaValidator('field1: string');
    var result = await schemaValidator.validateJson('{"field1": "toto"}');
    // just make sure the constructor does not throw
    expect(result).to.be.an('object');
    expect(result).to.have.property('field1', 'toto');
  });

  it('1.6 Test an invalid level one schema parameter', () => {
    expect(function() {new SchemaValidator('field1: upper')}).to.throw(NodeUtil.format(Errors.ErrMsg.Schema_InvalidSchemaParameter, 'upper', 'field1'));
  });

  it('1.7 Validate a string value against a one level schema of type number', async () => {
    var schemaValidator = new SchemaValidator('field1: number');
    await expectThrowsAsync(() => schemaValidator.validateJson('{"field1": "toto"}'), NodeUtil.format(Errors.ErrMsg.Schema_InvalidType, 'field1', 'toto', 'number'))
   });

  it('1.8 Validate a number against a one level schema of type number', async () => {
    var schemaValidator = new SchemaValidator('field1: number');
    var json = await schemaValidator.validateJson('{"field1": 123}');

    expect(json).to.be.an('object');
    expect(json).to.have.property('field1', 123);
  });

  it('1.9 Validate a simple json string against a simple two level schemaa', async () => {
    var schemaValidator = new SchemaValidator('field1: {type: string}');
    var json = await schemaValidator.validateJson('{"field1": "toto"}');

    expect(json).to.be.an('object');
    expect(json).to.have.property('field1', 'toto');
  });

  it('1.10 Validate a simple json string against a simple schema', async () => {
    var schemaValidator = new SchemaValidator('field1: {type: string, required}');
    var json = await schemaValidator.validateJson('{"field1": "toto"}');

    expect(json).to.be.an('object');
    expect(json).to.have.property('field1', 'toto');
  });

  it('1.11 Validate a missing field', async () => {
    var schemaValidator = new SchemaValidator('field1: {type: string, required}');
    await expectThrowsAsync(() => schemaValidator.validateJson('{"field": "toto"}'), NodeUtil.format(Errors.ErrMsg.Schema_MissingProp, 'field1'))
  });

  it('1.12 Valid type', async () => {
    var schemaValidator = new SchemaValidator('{field1: {type:string, required}}');
    var json = await schemaValidator.validateJson('{"field1": "toto"}');

    expect(json).to.be.an('object');
    expect(json).to.deep.equal({"field1": "toto"});
  });

  it('1.13 Invalid type (number instead of string)', async () => {
    var schemaValidator = new SchemaValidator('{field1: {type:string, required}}');
    await expectThrowsAsync(() => schemaValidator.validateJson('{"field1": 123}'), NodeUtil.format(Errors.ErrMsg.Schema_InvalidType, 'field1', '123', 'string'))
  });

  it('1.14 Validate upper', async () => {
    var schemaValidator = new SchemaValidator('{field1: {type:string, required, upper}}');
    var json = await schemaValidator.validateJson('{"field1": "toto"}');

    expect(json).to.be.an('object');
    expect(json).to.deep.equal({"field1": "TOTO"});
  });

  it('1.15 Invalid email', async () => {
    var schemaValidator = new SchemaValidator('{field1: email}');
    await expectThrowsAsync(() => schemaValidator.validateJson('{"field1": "aaaa"}'), NodeUtil.format(Errors.ErrMsg.Schema_InvalidType, 'field1', 'aaaa', 'email'))
  });

  it('1.16 Valid email', async () => {
    var schemaValidator = new SchemaValidator('{field1: email}');
    var json = await schemaValidator.validateJson('{"field1": "Aaaa@x.com"}');

    expect(json).to.be.an('object');
    expect(json).to.deep.equal({"field1": "aaaa@x.com"});
  });

  it('1.17 Invalid user_array', async () => {
    var schemaValidator = new SchemaValidator('field1: user_list');
    await expectThrowsAsync(() => schemaValidator.validateJson('{"field1": "aa, bb"}'), NodeUtil.format(Errors.ErrMsg.Schema_InvalidType, 'field1', 'aa, bb', 'user_array'))
  });

  it('1.18 Valid user_array', async () => {
    var schemaValidator = new SchemaValidator('field1: user_list');
    var json = await schemaValidator.validateJson('"field1": "@All, BB@gmail.com"');

    expect(json).to.be.an('object');
    expect(json).to.deep.equal({"field1": "@all, bb@gmail.com"});
  });

});

