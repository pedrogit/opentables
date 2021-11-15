const chai = require('chai');
const NodeUtil = require('util');

const Errors = require('../errors');
const Template = require('../template');

var expect = chai.expect;

describe('testTemplate.js List Item Template', () => {
  var schema = 'prop1: string, prop2: {type: string, required}';
  
  it('Test an empty string', () => {
    var template = new Template('', schema);
    var replStr  = template.render({prop1: "prop1_val", prop2: "prop2_val"});

    expect(replStr).to.be.an('string');
    expect(replStr).to.equal('prop2_val');
  });

  it('Test a non existing property', () => {
    /*var template = new Template('[[prop3]]', schema);
    var replStr  = template.render({prop1: "prop1_val", prop2: "prop2_val"});

    expect(replStr).to.be.an('string');
    expect(replStr).to.equal('');*/
    var tmpStr = '[[prop3]]';

    expect(function(){new Template(tmpStr, schema);}).to.throw(NodeUtil.format(Errors.ErrMsg.Component_Invalid, '"' + tmpStr + '"'));
  });

  it('Test a more complet template', () => {
    var template = new Template('<a src="[[prop1]]">[[prop2]]</a>', schema);
    var replStr  = template.render({prop1: "prop1_val", prop2: "prop2_val"});

    expect(replStr).to.be.an('string');
    expect(replStr).to.equal('<a src="prop1_val">prop2_val</a>');
  });

  it('Test an invalid template', () => {
    var componentDesc = 'prop1: {xxx}';
    var template = '<img src="[[' + componentDesc + ']]">';
    expect(function(){new Template(template, schema);}).to.throw(NodeUtil.format(Errors.ErrMsg.Component_Invalid, '"[[' + componentDesc + ']]"'));
  });

});

