//var assert = require('assert');
const chai = require('chai');
const ItemSchema = require('../listItemSchema');

const Utils = require('../utils/utils');

var expect = chai.expect;

describe('List Item Schema', () => {
  it('Pass null', () => {
    expect(function(){new ItemSchema();}).to.throw('ItemSchema: Schema can not be null...');
  });

  it('Pass invalid schema string', () => {
    expect(function(){new ItemSchema('toto');}).to.throw('Invalid OTSchema');
  });

  it('Pass a string schema', () => {
    var schema = new ItemSchema('field1: {type: string, required}');
    
    expect(schema).to.be.an('object');
  });

  it('Pass JSON schema', () => {
    var schema = new ItemSchema(Utils.OTSchemaToJSON('{field1: {type:string, required}}'));
    
    expect(schema).to.be.an('object');
  });

  it('Validate a simple json string against a simple schema', () => {
    var schema = new ItemSchema('field1: {type: string, required}');
    
    expect(schema.validateJson('{"field1": "toto"}')).to.be.an('object');
  });

  it('Validate a missing field', () => {
    var schema = new ItemSchema('field1: {type: string, required}');
    
    expect(function(){schema.validateJson('{"field": "toto"}')}).to.throw('ItemSchema: JSON object is not valid. "field1" is missing...');
  });

  it('Invalid type (number instead of string)', () => {
    var schema = new ItemSchema(Utils.OTSchemaToJSON('{field1: {type:string, required}}'));
    
    expect(function(){schema.validateJson('{"field1": 123}')}).to.throw('ItemSchema: JSON object is not valid. Field "field1" value (123) is not a string...');
  });
});

