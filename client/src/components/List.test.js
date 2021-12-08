import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';

import List from './List';

describe('List', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<List schema={{prop1: 'string'}} items={[{_id: 1, prop1: 'toto'}]}/>, div);
  });

  it('has a valid snapshot', () => {
    const component = renderer.create(
      <List schema={{prop1: 'string'}} items={[{_id: 1, prop1: 'toto'}]}/>
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

});