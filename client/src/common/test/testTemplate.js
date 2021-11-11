const chai = require('chai');
const Template = require('../template');

var expect = chai.expect;

describe('testTemplate.js List Item Template', () => {
  it('Test an empty string', () => {
    var template = new Template('', 'prop1: string, prop2: {type: string, required}');
    var replStr  = template.replaceValues({prop1: "prop1_val", prop2: "prop2_val"});

    expect(replStr).to.be.an('string');
    expect(replStr).to.equal('prop2_val');
  });

  it('Test a non existing property', () => {
    var template = new Template('', 'prop1: string, prop3: {type: string, required}');
    var replStr  = template.replaceValues({prop1: "prop1_val", prop2: "prop2_val"});

    expect(replStr).to.be.an('string');
    expect(replStr).to.equal('');
  });

  it('Test a a more complet template', () => {
    var template = new Template('<a src="[[prop1]]">[[prop2]]</a>', 'prop1: string, prop3: {type: string, required}');
    var replStr  = template.replaceValues({prop1: "prop1_val", prop2: "prop2_val"});

    expect(replStr).to.be.an('string');
    expect(replStr).to.equal('<a src="prop1_val">prop2_val</a>');
  });

});

