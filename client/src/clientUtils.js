import Cookies from 'js-cookie'
const jwt = require("jsonwebtoken");
const Globals = require("./common/globals");

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

const getScriptURL = () => {
  var allScript = document.getElementsByTagName('script');
  var myScript = allScript[allScript.length - 1];
  return myScript.src;
};

const getClientRecaptchaKey = () => {
  if (window.Cypress) {
    return '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // always positive key
  }
  if (getScriptURL().includes('heroku')) {
    return '6LdPHvkfAAAAAPnCFRuXO62WCccpsnp8SRh1JdDS'
  }
  return '6LcH-QkfAAAAAEKeUGIPbeY1OUlN4aQRkMyRoY_V';
}

export {getUser, getScriptURL, getClientRecaptchaKey}