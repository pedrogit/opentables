import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';

import VisibilityPasswordTextField from './VisibilityPasswordTextField';

describe('VisibilityPasswordTextField', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<VisibilityPasswordTextField />, div);
  });

  it('has a valid snapshot', () => {
    const component = renderer.create(
      <VisibilityPasswordTextField />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});