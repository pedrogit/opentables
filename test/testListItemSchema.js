//var assert = require('assert');
const chai = require('chai');
const ItemSchema = require('../listItemSchema');

const Utils = require('../utils/utils');
const Errors = require('../utils/errors');
const NodeUtil = require('util');

var expect = chai.expect;

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

  it('Validate a simple json string against a one level schema', () => {
    var schema = new ItemSchema('field1: string');
    // just make sure the constructor does not throw
    expect(schema.validateJson('{"field1": "toto"}')).to.be.an('object');
  });

  it('Test an invalid level one schema parameter', () => {
    expect(function(){new ItemSchema('field1: upper')}).to.throw(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidSchemaParameter, 'upper', 'field1'));
  });

  it('Validate a string value against a one level schema of type number', () => {
    var schema = new ItemSchema('field1: number');
    expect(function(){schema.validateJson('{"field1": "toto"}')}).to.throw(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, 'field1', 'toto', 'number'));
  });

  it('Validate a number against a one level schema of type number', () => {
    var schema = new ItemSchema('field1: number');
    var json = schema.validateJson('{"field1": 123}');

    expect(json).to.be.an('object');
    expect(json).to.have.property('field1', 123);
  });

  it('Validate a simple json string against a simple two level schemaa', () => {
    var schema = new ItemSchema('field1: {type: string}');
    var json = schema.validateJson('{"field1": "toto"}');

    expect(json).to.be.an('object');
    expect(json).to.have.property('field1', 'toto');
  });

  it('Validate a simple json string against a simple schema', () => {
    var schema = new ItemSchema('field1: {type: string, required}');
    var json = schema.validateJson('{"field1": "toto"}');

    expect(json).to.be.an('object');
    expect(json).to.have.property('field1', 'toto');
  });

  it('Validate a missing field', () => {
    var schema = new ItemSchema('field1: {type: string, required}');
    
    expect(function(){schema.validateJson('{"field": "toto"}')}).to.throw(NodeUtil.format(Errors.ErrMsg.ItemSchema_MissingField, 'field1'));
  });

  it('Valid type', () => {
    var schema = new ItemSchema('{field1: {type:string, required}}');
    var json = schema.validateJson('{"field1": "toto"}');

    expect(json).to.be.an('object');
    expect(json).to.deep.equal({"field1": "toto"});
  });

  it('Invalid type (number instead of string)', () => {
    var schema = new ItemSchema('{field1: {type:string, required}}');
    
    expect(function(){schema.validateJson('{"field1": 123}')}).to.throw(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, 'field1', '123', 'string'));
  });

  it('Validate upper', () => {
    var schema = new ItemSchema('{field1: {type:string, required, upper}}');
    var json = schema.validateJson('{"field1": "toto"}');

    expect(json).to.be.an('object');
    expect(json).to.deep.equal({"field1": "TOTO"});
  });

  it('Invalid email', () => {
    var schema = new ItemSchema('{field1: email}');
    expect(function(){schema.validateJson('{"field1": "aaaa"}')}).to.throw(NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, 'field1', 'aaaa', 'email'));
  });

  it('Valid email', () => {
    var schema = new ItemSchema('{field1: email}');
    var json = schema.validateJson('{"field1": "Aaaa@x.com"}');

    expect(json).to.be.an('object');
    expect(json).to.deep.equal({"field1": "aaaa@x.com"});
  });

});

