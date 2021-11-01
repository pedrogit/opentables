//var assert = require('assert');
const chai = require('chai');
const Filter = require('../filter');

const Utils = require('../utils');
const Errors = require('../errors');
const NodeUtil = require('util');

var expect = chai.expect;

describe('testListFilter.js List Item Filter', () => {
  it('Pass null', () => {
    var filter = new Filter();
    var finalFilter  = filter.final();
    expect(finalFilter).to.be.null;
  });

  it('Test a string filter', () => {
    var filter = new Filter('field1: "aaa"');
    var finalFilter  = filter.final();

    expect(finalFilter).to.be.an('object');
    expect(finalFilter).to.have.property('field1', 'aaa');
  });

  it('Pass JSON filter', () => {
    var filter = new Filter({field1: "aaa"});
    var finalFilter  = filter.final();

    expect(finalFilter).to.be.an('object');
    expect(finalFilter).to.have.property('field1', 'aaa');
  });

  it('Test $contains', () => {
    var filter = new Filter('$contains: [$field1, aaa]');
    var finalFilter  = filter.final();

    expect(finalFilter).to.be.an('object');
    expect(finalFilter).to.have.deep.property('$regexFind', {input: '$field1', regex:  'aaa'});
  });

});

