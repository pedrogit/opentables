import Cookies from 'js-cookie'
const jwt = require("jsonwebtoken");

const getUser = function() {
  var authtoken = Cookies.get('authtoken');
  if (authtoken) {
    return jwt.decode(authtoken).email;
  }
  return '';
}

export default getUser