import Cookies from 'js-cookie'
const jwt = require("jsonwebtoken");
const Globals = require("./common/globals");

const getUser = function() {
  var authtoken = Cookies.get('authtoken');
  if (authtoken) {
    return jwt.decode(authtoken).email;
  }
  return Globals.allUserName;
}

export default getUser