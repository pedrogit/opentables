/* eslint-env mocha */
import React from "react";
import ReactDOM from "react-dom";
import renderer from "react-test-renderer";

import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<LoginForm />, div);
  });

  it("has a valid snapshot", () => {
    const component = renderer.create(<LoginForm />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
