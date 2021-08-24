//var assert = require('assert');
const chai = require('chai');
const ItemFilter = require('../listItemFilter');

const Utils = require('../utils/utils');
const Errors = require('../utils/errors');
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
    expect(finalFilter).to.have.deep.property('$gt', [{'$indexOfCP': ['$field1', 'aaa']}, -1]);
  });

});

