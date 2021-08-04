const chai = require('chai');
const Utils = require('../utils/utils');

var expect = chai.expect;

describe('Test Utils functions', () => {
  describe('Test trimFromEdges', () => {
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

  describe('Test OTSchemaToJSON', () => {
    it('Test OTSchemaToJSON', () => {    
      expect(Utils.OTSchemaToJSON('{field1: required}')).to.equal({"field1": {"required": true}});
    });

  });

});

