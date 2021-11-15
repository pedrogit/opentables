const chai = require('chai');
const NodeUtil = require('util');

const Errors = require('../common/errors');
const Component = require('../component');

var expect = chai.expect;

describe('testcomponent.js List Item component', () => {
  var schema = 'prop1: string, prop2: {type: string, required}';
  
  it('Test an empty string', () => {
    expect(function(){new Component('');}).to.throw(NodeUtil.format(Errors.ErrMsg.Component_Invalid, '"[[]]"'));
  });

  it('Test a simple property name', () => {
    var component = new Component('prop3');

    expect(component).to.be.an('object');
    expect(component).to.deep.equal({component: {prop3: true}, targetProp: 'prop3'});
  });

  it('Test an invalid property name', () => {
    var cmpStr = 'prop2+name';
    expect(function(){new Component(cmpStr);}).to.throw(NodeUtil.format(Errors.ErrMsg.Component_Invalid, '"[[' + cmpStr + ']]"'));
  });

  it('Test with a control type', () => {
    var component = new Component('prop1: {control: "text"}');

    expect(component).to.be.an('object');
    expect(component.component).to.deep.equal({prop1: {control: 'text'}});
    expect(component.targetProp).to.equal('prop1');
  });

});

