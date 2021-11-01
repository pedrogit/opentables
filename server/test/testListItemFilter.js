//var assert = require('assert');
const chai = require('chai');
const ItemFilter = require('../listItemFilter');

const Utils = require('../utils');
const Errors = require('../errors');
const NodeUtil = require('util');

var expect = chai.expect;

describe('testListItemFilter.js List Item Filter', () => {
  it('Pass null', () => {
    var filter = new ItemFilter();
    var finalFilter  = filter.final();
    expect(finalFilter).to.be.null;
  });

  it('Test a string filter', () => {
    var filter = new ItemFilter('field1: "aaa"');
    var finalFilter  = filter.final();

    expect(finalFilter).to.be.an('object');
    expect(finalFilter).to.have.property('field1', 'aaa');
  });

  it('Pass JSON filter', () => {
    var filter = new ItemFilter({field1: "aaa"});
    var finalFilter  = filter.final();

    expect(finalFilter).to.be.an('object');
    expect(finalFilter).to.have.property('field1', 'aaa');
  });

  it('Test $contains', () => {
    var filter = new ItemFilter('$contains: [$field1, aaa]');
    var finalFilter  = filter.final();

    expect(finalFilter).to.be.an('object');
    expect(finalFilter).to.have.deep.property('$regexFind', {input: '$field1', regex:  'aaa'});
  });

});

