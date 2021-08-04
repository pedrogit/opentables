const chai = require('chai');
const ItemSchema = require('../listItemSchema');

const Utils = require('../utils/utils');

var expect = chai.expect;

describe('List Item Schema', () => {
  it('Simple test', () => {
    var schema = new ItemSchema(Utils.OTSchemaToJSON('{field1: {string: true, required: true}}'));
    
    expect(schema.validate('{field1: \'toto\'}')).to.be.true;
  });
});

