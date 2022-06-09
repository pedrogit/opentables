/* eslint-env mocha */
import React from "react";
import ReactDOM from "react-dom";
import renderer from "react-test-renderer";

import { Text } from "./components";

describe("Text", () => {
  it("renders Text without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <Text val={{ prop: "Prop name", val: "prop value" }} />,
      div
    );
  });

  it("renders Text without prop name without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<Text val={{ val: "prop value" }} />, div);
  });

  it("renders Text without value without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<Text val={{ prop: "Prop name" }} />, div);
  });

  it("renders Text without prop without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<Text />, div);
  });

  it("has a valid snapshot", () => {
    const component = renderer.create(
      <Text val={{ prop: "Prop name", val: "prop value" }} />
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
