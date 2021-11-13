const chai = require('chai');
const Utils = require('../utils');

var expect = chai.expect;

describe('testUtils.js Test Utils functions', () => {
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

    it('Simple string', () => {
      var result = Utils.completeTrueValues('field1');
      expect(result).to.equal('field1: true');
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

    it('Double quoted key', () => {
      var result = Utils.completeTrueValues('{field1: {  "required"  }}');
      expect(result).to.equal('{field1: {"required": true}}');
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

    it('Already double quoted', () => {
      var result = Utils.doubleQuoteKeys('{"field1": required}');
      expect(result).to.equal('{"field1": required}');
    });

    it('Key starting with a dollars sign', () => {
      var result = Utils.doubleQuoteKeys('{$field1: required}');
      expect(result).to.equal('{"$field1": required}');
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

    it('Two values', () => {
      var result = Utils.doubleQuoteWordValues('field1: required, field2: required');
      expect(result).to.equal('field1: "required", field2: "required"');
    });

    it('Two values, one already quoted', () => {
      var result = Utils.doubleQuoteWordValues('field1: required, field2: "required"');
      expect(result).to.equal('field1: "required", field2: "required"');
    });

    it('One quoted value containing :', () => {
      var result = Utils.doubleQuoteWordValues('field1: required, field2: "requ:ired"');
      expect(result).to.equal('field1: "required", field2: "requ:ired"');
    });

    it('One quoted value containing ,', () => {
      var result = Utils.doubleQuoteWordValues('field1: required, field2: "requ,ired"');
      expect(result).to.equal('field1: "required", field2: "requ,ired"');
    });

    it('One quoted value containing }', () => {
      var result = Utils.doubleQuoteWordValues('field1: required, field2: "requ}ired"');
      expect(result).to.equal('field1: "required", field2: "requ}ired"');
    });

    it('One quoted value containing } at the end', () => {
      var result = Utils.doubleQuoteWordValues('field1: required, field2: "required}"');
      expect(result).to.equal('field1: "required", field2: "required}"');
    });

    it('One quoted value containing "', () => {
      var result = Utils.doubleQuoteWordValues('field1: required, field2: "requ\"ired"');
      expect(result).to.equal('field1: "required", field2: "requ\"ired"');
    });
    
    it('One quoted value containing " at the end', () => {
      var result = Utils.doubleQuoteWordValues('field1: required, field2: "requ\"ired\""');
      expect(result).to.equal('field1: "required", field2: "requ\"ired\""');
    });

    it('One quoted value containing \'', () => {
      var result = Utils.doubleQuoteWordValues('field1: required, field2: "requ\'ired"');
      expect(result).to.equal('field1: "required", field2: "requ\'ired"');
    });

    it('One quoted value containing \\', () => {
      var result = Utils.doubleQuoteWordValues('field1: required, field2: "requ\\ired"');
      expect(result).to.equal('field1: "required", field2: "requ\\ired"');
    });

    it('Value in key', () => {
      var result = Utils.doubleQuoteWordValues('testschema: schema');
      expect(result).to.equal('testschema: "schema"');
    });
  });

  describe('Test simpleJSONToJSON()', () => {
    it('Simple test', () => {
      var result = Utils.simpleJSONToJSON('field1: {required}');
      expect(result).to.deep.equal({"field1": {"required": true}});
    });

    it('Test empty JSON schema', () => {
      var result = Utils.simpleJSONToJSON('{}');
      expect(result).to.deep.equal({});
    });
  
    it('Test simple string', () => {
      var result = Utils.simpleJSONToJSON('abc');
      expect(result).to.deep.equal({"abc": true});
    });

    it('Simple test with two values', () => {
      var result = Utils.simpleJSONToJSON('a: {b, c}');
      expect(result).to.deep.equal({"a": {"b": true, "c": true}});
    });
  
    it('Simple test with one set value and two unset values', () => {
      var result = Utils.simpleJSONToJSON('a: {b, c:true, d}');
      expect(result).to.deep.equal({"a": {"b": true, "c": true, d: true}});
    });
  
    it('Simple test with two base values', () => {
      var result = Utils.simpleJSONToJSON('a: {b, c}, d: {e}');
      expect(result).to.deep.equal({"a": {"b": true, "c": true}, d:{e:true}});
    });
  });
  
  describe('Test objWithout()', () => {
    it('Simple test with without as a string', () => {
      var result = Utils.objWithout({a: 1, b: 2}, 'b');
      expect(result).to.deep.equal({a: 1});
    });

    it('Simple test with without as an array', () => {
      var result = Utils.objWithout({a: 1, b: 2, c: 3}, ['a', 'c']);
      expect(result).to.deep.equal({b: 2});
    });

    it('Simple that object is deeply copied', () => {
      var obj1 = {a: 1, b: 2, c: 3};
      var result = Utils.objWithout(obj1, ['a', 'c']);
      expect(result).to.deep.equal({b: 2});
      expect(obj1).to.deep.equal(obj1);
    });

  });
});
