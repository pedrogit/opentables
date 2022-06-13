import Cookies from "js-cookie";

const jwt = require("jsonwebtoken");
const Globals = require("../../common/globals");

const getUser = () => {
  const authtoken = Cookies.get("authtoken");
  if (authtoken) {
    const user = jwt.decode(authtoken).username;
    if (user !== null && user !== "") {
      return user;
    }
    Cookies.remove("authtoken");
  }
  return Globals.allUserName;
};

const getURLParam = (paramName) => {
  const url = new URL(window.location.href);
  return url.searchParams.get(paramName);
};

const getScriptBaseURL = (() => {
  const allScripts = document.getElementsByTagName("script");
  const thisScript = allScripts[allScripts.length - 1];
  return () => thisScript.src.slice(0, -12);
})();

export { getUser, getURLParam, getScriptBaseURL };
