import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';

import Item from './Item';

describe('Item', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Item />, div);
  });

  it('has a valid snapshot', () => {
    const component = renderer.create(
      <Item />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});