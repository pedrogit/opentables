//var assert = require('assert');
const chai = require('chai');
const ItemSchema = require('../listItemSchema');

const Utils = require('../utils/utils');
const Errors = require('../utils/errors');
const NodeUtil = require('util');

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

describe('testListItemSchema.js List Item Schema', () => {
  it('Pass null', () => {
    expect(function(){new ItemSchema();}).to.throw(Errors.ErrMsg.ItemSchema_Null);
  });

  it('Pass invalid schema string', () => {
    expect(function(){new ItemSchema('toto');}).to.throw(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidSchema, 'toto'));
  });

  it('Pass a string schema', () => {
    var schema = new ItemSchema('field1: {type: string, required}');
    // just make sure the constructor does not throw
    expect(schema).to.be.an('object');
  });

  it('Pass JSON schema', () => {
    var schema = new ItemSchema({field1: {type: 'string', required: true}});
    // just make sure the constructor does not throw
    expect(schema).to.be.an('object');
  });

  it('Validate a simple json string against a one level schema', async () => {
    var schema = new ItemSchema('field1: string');
    var result = await schema.validateJson('{"field1": "toto"}');
    // just make sure the constructor does not throw
    expect(result).to.be.an('object');
    expect(result).to.have.property('field1', 'toto');
  });

  it('Test an invalid level one schema parameter', () => {
    expect(function() {new ItemSchema('field1: upper')}).to.throw(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidSchemaParameter, 'upper', 'field1'));
  });

  it('Validate a string value against a one level schema of type number', async () => {
    var schema = new ItemSchema('field1: number');
    await expectThrowsAsync(() => schema.validateJson('{"field1": "toto"}'), NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, 'field1', 'toto', 'number'))
   });

  it('Validate a number against a one level schema of type number', async () => {
    var schema = new ItemSchema('field1: number');
    var json = await schema.validateJson('{"field1": 123}');

    expect(json).to.be.an('object');
    expect(json).to.have.property('field1', 123);
  });

  it('Validate a simple json string against a simple two level schemaa', async () => {
    var schema = new ItemSchema('field1: {type: string}');
    var json = await schema.validateJson('{"field1": "toto"}');

    expect(json).to.be.an('object');
    expect(json).to.have.property('field1', 'toto');
  });

  it('Validate a simple json string against a simple schema', async () => {
    var schema = new ItemSchema('field1: {type: string, required}');
    var json = await schema.validateJson('{"field1": "toto"}');

    expect(json).to.be.an('object');
    expect(json).to.have.property('field1', 'toto');
  });

  it('Validate a missing field', async () => {
    var schema = new ItemSchema('field1: {type: string, required}');
    await expectThrowsAsync(() => schema.validateJson('{"field": "toto"}'), NodeUtil.format(Errors.ErrMsg.ItemSchema_MissingField, 'field1'))
  });

  it('Valid type', async () => {
    var schema = new ItemSchema('{field1: {type:string, required}}');
    var json = await schema.validateJson('{"field1": "toto"}');

    expect(json).to.be.an('object');
    expect(json).to.deep.equal({"field1": "toto"});
  });

  it('Invalid type (number instead of string)', async () => {
    var schema = new ItemSchema('{field1: {type:string, required}}');
    await expectThrowsAsync(() => schema.validateJson('{"field1": 123}'), NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, 'field1', '123', 'string'))
  });

  it('Validate upper', async () => {
    var schema = new ItemSchema('{field1: {type:string, required, upper}}');
    var json = await schema.validateJson('{"field1": "toto"}');

    expect(json).to.be.an('object');
    expect(json).to.deep.equal({"field1": "TOTO"});
  });

  it('Invalid email', async () => {
    var schema = new ItemSchema('{field1: email}');
    await expectThrowsAsync(() => schema.validateJson('{"field1": "aaaa"}'), NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, 'field1', 'aaaa', 'email'))
  });

  it('Valid email', async () => {
    var schema = new ItemSchema('{field1: email}');
    var json = await schema.validateJson('{"field1": "Aaaa@x.com"}');

    expect(json).to.be.an('object');
    expect(json).to.deep.equal({"field1": "aaaa@x.com"});
  });

  it('Invalid user_array', async () => {
    var schema = new ItemSchema('field1: user_array');
    try {
      var json = await schema.validateJson('{"field1": "aa, bb"}');
    } catch(err) {
      console.log('aa');
    }
    await expectThrowsAsync(() => schema.validateJson('{"field1": "aa, bb"}'), NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, 'field1', 'aa, bb', 'user_array'))
  });

  it('Valid user_array', async () => {
    var schema = new ItemSchema('field1: user_array');
    var json = await schema.validateJson('"field1": "@All, BB@gmail.com"');

    expect(json).to.be.an('object');
    expect(json).to.deep.equal({"field1": "@all, bb@gmail.com"});
  });

});

