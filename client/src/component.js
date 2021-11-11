const NodeUtil = require('util');

const Utils = require('./common/utils');
const Errors = require('./common/errors');

class Component {
  constructor(componentStr) {
    try {
      this.props = Utils.simpleJSONToJSON(componentStr);
    } catch(err) {
      throw new Error(NodeUtil.format(Errors.ErrMsg.Component_Malformed, componentStr, err.message));
    };
    this.targetVar = Object.keys(this.props)[0];
  }

  render(values) {
    var result = values[this.targetVar];
    return result === undefined ? '' : result;
  }
}

module.exports = Component;
