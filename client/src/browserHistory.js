
  const Globals = require("../../client/src/common/globals");
  const Utils = require("./common/utils");

  var appRegistry = [];

  const viewQueryStrPrefix = "viewid_";

  const modifyQueryString = (appid, listid) => {
    if (listid !== undefined && listid !== null) {
      var url = new URL(window.location.href);
      var newURL = url.href;

      if (url.searchParams.get(viewQueryStrPrefix + appid) === null) {
        // add viewid to the url
        if (!(newURL.includes("?"))) {
          newURL = newURL + "?"
        }
        else if (!(newURL.endsWith("?"))) {
          newURL = newURL + "&"
        };
        newURL = newURL + viewQueryStrPrefix + appid + "=" + listid;
      }
      else {
        // search and replace it
        var regex = new RegExp(viewQueryStrPrefix + appid + "=[a-z0-9]*");
        newURL = newURL.replace(regex, viewQueryStrPrefix + appid + "=" + listid);
      }
      return newURL;
    }
  }

  const pushHistoryState = (appid, listid) => {
    if (listid !== undefined && listid !== null) {
      var currentState = window.history.state;
      if (!currentState) {
        currentState = {};
      }
      if (!currentState[Globals.browserHistoryKey]) {
        currentState[Globals.browserHistoryKey] = [];
      }
      if (!currentState[Globals.browserHistoryKey][appid] || currentState[Globals.browserHistoryKey][appid] !== listid) {
          currentState[Globals.browserHistoryKey][appid] = listid;
      
        var newURL = modifyQueryString(appid, listid);

        window.history.pushState(currentState, 'title', newURL);
      }
    }
  }
  
  const getViewIdFromURL = (appid) => {
    return Utils.getURLParam(viewQueryStrPrefix + appid);
  }

  const registerApp = (appid, setViewId) => {
    appRegistry[appid] = setViewId;
  }
  
  window.onpopstate = (event) => {
    for (let appid = 0; appid < appRegistry.length; ++appid) {
      if (event.state && event.state[Globals.browserHistoryKey][appid]) {
        (appRegistry[appid])(event.state[Globals.browserHistoryKey][appid]);
      }
      else {
        (appRegistry[appid])(null);
      }
    }
  }

  export {pushHistoryState, getViewIdFromURL, registerApp}