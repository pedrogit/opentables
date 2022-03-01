import Cookies from 'js-cookie'
const jwt = require("jsonwebtoken");
const Globals = require("../../client/src/common/globals");

const getUser = function() {
  var authtoken = Cookies.get('authtoken');
  if (authtoken) {
    return jwt.decode(authtoken)[Globals.emailFieldName];
  }
  return '';
}

export default getUser