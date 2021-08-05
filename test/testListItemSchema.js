//var assert = require('assert');
const chai = require('chai');
const ItemSchema = require('../listItemSchema');

const Utils = require('../utils/utils');

var expect = chai.expect;

describe('List Item Schema', () => {
  it('Pass null', () => {
    expect(function(){new ItemSchema();}).to.throw('ItemSchema can not be null...');
  });

  it('Pass invalid schema string', () => {
    expect(function(){new ItemSchema('toto');}).to.throw('Invalid OTSchema');
  });

  it('Pass a string schema', () => {
    var schema = new ItemSchema('field1: {type: string, required}');
    
    expect(schema.validate('{field1: \'toto\'}')).to.be.true;
  });

  it('Pass JSON schema', () => {
    var schema = new ItemSchema(Utils.OTSchemaToJSON('{field1: {string: true, required: true}}'));
    
    expect(schema.validate('{field1: \'toto\'}')).to.be.true;
  });
});

