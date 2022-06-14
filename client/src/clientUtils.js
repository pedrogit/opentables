import Cookies from "js-cookie";

const jwt = require("jsonwebtoken");
const Globals = require("../../common/globals");

const getURLParam = (paramName) => {
  const url = new URL(window.location.href);
  return url.searchParams.get(paramName);
};

const getScriptBaseURL = (() => {
  const allScripts = document.getElementsByTagName("script");
  const thisScript = allScripts[allScripts.length - 1];
  return () => thisScript.src.slice(0, -12);
})();

const getScriptDomain = () => {
  // use URL constructor and return hostname
  return new URL(getScriptBaseURL()).hostname;
};

const getUser = () => {
  console.log(JSON.stringify(Cookies.get()));
  const authtoken = Cookies.get("authtoken");
  if (authtoken) {
    const user = jwt.decode(authtoken).username;
    // eslint-disable-next-line no-alert
    console.log(`user=${user}`);
    if (user !== null && user !== "") {
      return user;
    }
    Cookies.remove("authtoken", { path: "", domain: `.${getScriptDomain()}` });
  }
  return Globals.allUserName;
};

export { getUser, getURLParam, getScriptBaseURL, getScriptDomain };
