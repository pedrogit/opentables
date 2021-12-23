import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';

import List from './List';
const Globals = require("../common/globals");


describe('List', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <List 
        type='Item' 
        view={{item_template: ''}} 
        list={{[Globals.listSchemaFieldName]: {prop1: 'string'}}} 
        items={[{_id: 1, prop1: 'toto'}]}
      />, div);
  });

  it('has a valid snapshot', () => {
    const component = renderer.create(
      <List 
        type='Item' 
        view={{item_template: ''}} 
        list={{[Globals.listSchemaFieldName]: {prop1: 'string'}}} 
        items={[{_id: 1, prop1: 'toto'}]}
      />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

});