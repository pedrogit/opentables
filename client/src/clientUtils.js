import Cookies from 'js-cookie'
const jwt = require("jsonwebtoken");
const Globals = require("../../common/globals");

const getUser = () => {
  var authtoken = Cookies.get('authtoken');
  if (authtoken) {
    var user = jwt.decode(authtoken).username;
    if (user !== null && user !=='') {
      return user;
    }
    Cookies.remove('authtoken');
  }
  return Globals.allUserName;
}

const getURLParam = (paramName) => {
  var url = new URL(window.location.href);
  return url.searchParams.get(paramName);
}

export {getUser, getURLParam}