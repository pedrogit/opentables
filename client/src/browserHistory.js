const Globals = require("../../common/globals");
const Utils = require("./clientUtils");

const appRegistry = [];

const viewQueryStrPrefix = "viewid_";

const modifyQueryString = (appid, listid) => {
  if (listid !== undefined && listid !== null) {
    const url = new URL(window.location.href);
    let newURL = url.href;

    if (url.searchParams.get(viewQueryStrPrefix + appid) === null) {
      // add viewid to the url
      if (!newURL.includes("?")) {
        newURL += "?";
      } else if (!newURL.endsWith("?")) {
        newURL += "&";
      }
      newURL = `${newURL + viewQueryStrPrefix + appid}=${listid}`;
    } else {
      // search and replace it
      const regex = new RegExp(`${viewQueryStrPrefix + appid}=[a-z0-9]*`);
      newURL = newURL.replace(regex, `${viewQueryStrPrefix + appid}=${listid}`);
    }
    return newURL;
  }
  return null;
};

const pushHistoryState = (appid, listid) => {
  if (listid !== undefined && listid !== null) {
    let currentState = window.history.state;
    if (!currentState) {
      currentState = {};
    }
    if (!currentState[Globals.browserHistoryKey]) {
      currentState[Globals.browserHistoryKey] = [];
    }
    if (
      !currentState[Globals.browserHistoryKey][appid] ||
      currentState[Globals.browserHistoryKey][appid] !== listid
    ) {
      currentState[Globals.browserHistoryKey][appid] = listid;

      const newURL = modifyQueryString(appid, listid);

      window.history.pushState(currentState, "title", newURL);
    }
  }
};

const getViewIdFromURL = (appid) => {
  return Utils.getURLParam(viewQueryStrPrefix + appid);
};

const registerApp = (appid, setViewId) => {
  appRegistry[appid] = setViewId;
};

window.onpopstate = (event) => {
  for (let appid = 0; appid < appRegistry.length; appid += 1) {
    if (event.state && event.state[Globals.browserHistoryKey][appid]) {
      appRegistry[appid](event.state[Globals.browserHistoryKey][appid]);
    } else {
      appRegistry[appid](null);
    }
  }
};

export { pushHistoryState, getViewIdFromURL, registerApp };
