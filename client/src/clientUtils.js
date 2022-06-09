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

export { getUser, getURLParam };
