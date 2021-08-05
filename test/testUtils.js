const chai = require('chai');
const Utils = require('../utils/utils');

var expect = chai.expect;

describe('Test Utils functions', () => {
  describe('Test trimFromEdges()', () => {
    it('Simple test. Default to removing double quotes"', () => {    
      expect(Utils.trimFromEdges('"aaaa"')).to.equal('aaaa');
    });

    it('Simple test. Explicitly provides double quotes as a character', () => {    
      expect(Utils.trimFromEdges('"aaaa"', '"')).to.equal('aaaa');
    });

    it('Simple test. Explicitly provides double quotes as an array', () => {    
      expect(Utils.trimFromEdges('"aaaa"', ['"'])).to.equal('aaaa');
    });

    it('Provides 2 characters long remove strings', () => {
      expect(function () {Utils.trimFromEdges('"aaaa"', ['({', '})'])}).to.throw('Unspecified AssertionError');
    });
    
    it('Provides 3 remove strings', () => {    
      expect(function () {Utils.trimFromEdges('"aaaa"', ['({', '})', '"'])}).to.throw('Unspecified AssertionError');
    });

    it('With space at the end without removing them first', () => {
      var result = Utils.trimFromEdges('"aaaa" ');
      expect(result).to.equal('"aaaa" ');
    });

    it('With space at the end removing them first', () => { 
      var result = Utils.trimFromEdges('"aaaa" ', '"', true, true);
      expect(result).to.equal('aaaa');
    });

    it('With space at the end removing them first and removing inside spaces too', () => { 
      var result = Utils.trimFromEdges('"aaaa " ', '"', true, true);
      expect(result).to.equal('aaaa');
    });

    it('With two brackets', () => {
      var result = Utils.trimFromEdges('{aaaa}', ['{', '}']);
      expect(result).to.equal('aaaa');
    });

    it('Remove surrounding space even if trimming characters are not found', () => { 
      var result = Utils.trimFromEdges(' {aaaa}', '"', true, false);
      expect(result).to.equal('{aaaa}');
    });

    it('Remove space surrounding trimmed string when trimming characters are not found has no effect', () => { 
      var result = Utils.trimFromEdges(' {aaaa }', '"', true, true);
      expect(result).to.equal('{aaaa }');
    });

  });

  describe('Test completeTrueValues()', () => {
    it('Simple test', () => {
      var result = Utils.completeTrueValues('{field1: {required}}');
      expect(result).to.equal('{field1: {required: true}}');
    });

    it('No spaces', () => {
      var result = Utils.completeTrueValues('{field1:{required}}');
      expect(result).to.equal('{field1:{required: true}}');
    });
    
    it('More spaces', () => {
      var result = Utils.completeTrueValues('{field1: {  required  }}');
      expect(result).to.equal('{field1: {required: true}}');
    });

    it('More complex key', () => {
      var result = Utils.completeTrueValues('{00fi-eld_1: {00fi-eld_2}}');
      expect(result).to.equal('{00fi-eld_1: {00fi-eld_2: true}}');
    });

    it('More values', () => {
      var result = Utils.completeTrueValues('{a: {b, c}}');
      expect(result).to.equal('{a: {b: true, c: true}}');
    });

    it('Double quoted keys', () => {
      var result = Utils.completeTrueValues('{a: {"b"}}');
      expect(result).to.equal('{a: {"b": true}}');
    });
  });

  describe('Test doubleQuoteKeys()', () => {
    it('Simple test', () => {
      var result = Utils.doubleQuoteKeys('{field1: required}');
      expect(result).to.equal('{"field1": required}');
    });
  });

  describe('Test doubleQuoteWordValues()', () => {
    it('Without surrounding braces', () => {
      var result = Utils.doubleQuoteWordValues('field1: required');
      expect(result).to.equal('field1: "required"');
    });

    it('True without surrounding braces', () => {
      var result = Utils.doubleQuoteWordValues('field1: true');
      expect(result).to.equal('field1: true');
    });

    it('With surrounding braces', () => {
      var result = Utils.doubleQuoteWordValues('{field1: required}');
      expect(result).to.equal('{field1: "required"}');
    });

    it('True with surrounding braces', () => {
      var result = Utils.doubleQuoteWordValues('{field1: true}');
      expect(result).to.equal('{field1: true}');
    });

    it('True with surrounding braces', () => {
      var result = Utils.doubleQuoteWordValues('field1: required, field2: required');
      expect(result).to.equal('field1: "required", field2: "required"');
    });
  });


  describe('Test OTSchemaToJSON()', () => {
    it('Simple test', () => {
      var result = Utils.OTSchemaToJSON('field1: {required}');
      expect(result).to.deep.equal({"field1": {"required": true}});
    });

    it('Simple test with two values', () => {
      var result = Utils.OTSchemaToJSON('a: {b, c}');
      expect(result).to.deep.equal({"a": {"b": true, "c": true}});
    });

    it('Simple test with one set value and two unset values', () => {
      var result = Utils.OTSchemaToJSON('a: {b, c:true, d}');
      expect(result).to.deep.equal({"a": {"b": true, "c": true, d: true}});
    });

    it('Simple test with two base values', () => {
      var result = Utils.OTSchemaToJSON('a: {b, c}, d: {e}');
      expect(result).to.deep.equal({"a": {"b": true, "c": true}, d:{e:true}});
    });
  });});

