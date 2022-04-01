import React from "react";
import { createTheme, ThemeProvider, lighten } from "@mui/material/styles";
import { deepOrange, orange } from "@mui/material/colors";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";

// local imports
import List from "./components/List";
import Header from "./components/Header";

import ConfigPanel from "./components/ConfigPanel";
import ErrorPanel from "./components/ErrorPanel";
import {LoginForm} from "./components/LoginForm";
import getUser from "./clientUtils";
import * as BrowserHistory from "./browserHistory";
const Globals = require("../../client/src/common/globals");
const Utils = require("./common/utils");

const theme = createTheme({
  palette: {
    primary: {
      main: deepOrange[900], //#bf360c
      palebg: (theme) => lighten(theme.palette.primary.light, 0.9)
    },
    secondary: {
      main: orange["A200"], //#ffab40
    },
    error: {
      main: deepOrange[900], //#6a1b9a
    },
    warning: {
      main: orange["A200"], //#ffab40
    },
  },
  openTable: {
    buttonPadding: "4px"
  }
});

function App({ initialViewid, appid }) {
  const [viewid, setViewId] = React.useState(BrowserHistory.getViewIdFromURL(appid) ? BrowserHistory.getViewIdFromURL(appid) : initialViewid);
  const [viewid2, setViewId2] = React.useState(null);
  const [viewData, setViewData] = React.useState(null);
  const [configPanelOpen, toggleConfigPanel] = React.useState(false);
  const [loginState, setLoginState] = React.useState({open: false});
  const [errorMsg, setErrorMsg] = React.useState(null);
  const [addItem, setAddItem] = React.useState(false);

  const closeAll = React.useCallback(
    () => {
      setErrorMsg({open: false});
      toggleConfigPanel(false);
    }, [setErrorMsg, toggleConfigPanel]
  );

  const handleReload = React.useCallback(
    () => {
      closeAll();
      // make the list of items to flash to nothing before reloading
      setViewData({
        ...Utils.objWithout(viewData, Globals.childlistFieldName),
        [Globals.childlistFieldName]: Utils.objWithout(viewData[Globals.childlistFieldName], "items")
      });
      var oldViewid = viewid;
      setViewId(null);
      setViewId2(oldViewid);
    }, [viewid, viewData, setViewData, toggleConfigPanel, setErrorMsg]
  );

  const handleChangeViewId = React.useCallback(
    (viewid) => {
      closeAll();
      setViewId(viewid);
    }, [setErrorMsg, setViewId, toggleConfigPanel]
  );

  React.useEffect(() => {
    BrowserHistory.registerApp(appid, handleChangeViewId);
  }, [appid, handleChangeViewId]);

  React.useEffect(() => {
    // initial loading of list data
    if (viewid2) {
      setViewId(viewid2);
      setViewId2(null);
    }
    if (viewid) {
      setLoginState({
        open: false,
        msg: {
          severity: "warning",
          title: "Permission denied",
          text: 'You do not have permissions to view this list. Please login with valid credentials...'
        },
        action: {
          method: "get",
          url: "http://localhost:3001/api/opentables/" + (viewid ? viewid : ''),
          callback: (success, data) => {
            if (success) {
              setViewData(data);
              BrowserHistory.pushHistoryState(appid, viewid);
            }
          }
        },
        tryFirst: true
      });
    }
  }, [viewid, viewid2, appid]);

  const handleOpenConfigPanel = () => {
    var user = getUser();
    var authView = Utils.validateRWPerm({
      user: user,
      item: viewData,
      throwError: false
    });
    var authList = true;
    if (viewData[Globals.childlistFieldName]) {
      authList = Utils.validateRWPerm({
        user: user,
        list: viewData[Globals.childlistFieldName],
        throwError: false
      });
    }
    if (!(authView || authList)) {
      // open login dialog
      setLoginState({
        open: true, 
        msg: {
          severity: "warning",
          title: "Permission denied",
          text:
          'You do not have permissions to configure this list. Please login with valid credentials...',
        },
        action: {
          method: "get",
          url: "http://localhost:3001/api/opentables/login",
          callback: (success) => {
            if (success) {
              toggleConfigPanel(!configPanelOpen);
            }
          }
        },
        tryFirst: false
      });

    }
    else {
      toggleConfigPanel(!configPanelOpen);
    }
    return authView;
  }

  //console.log('Render App (' + (data ? 'filled' : 'empty') + ')...');
  return (
    <ThemeProvider theme={theme}>
      <Container id={"otapp_" + appid} disableGutters maxWidth="100%" sx={{height: "100%"}}>
      <Stack sx={{height: "100%"}}>
        <Header 
          viewOwner={viewData ? viewData.owner : ''} 
          viewName={viewData ? viewData.name : ''}
          setLoginState={setLoginState} 
          handleOpenConfigPanel={handleOpenConfigPanel} 
          setAddItem={setAddItem}
          setViewId={handleChangeViewId}
          handleReload={handleReload}
        />
        <ErrorPanel errorMsg={errorMsg} setErrorMsg={setErrorMsg}/>
        <LoginForm 
          sx={{borderBottomWidth: '5px', borderBottomStyle: 'solid', borderBottomColor: theme.palette.primary.main}}
          loginState={loginState}
          setLoginState={setLoginState}
          setErrorMsg={setErrorMsg}
        />
        {(viewData) ? (
          <Stack className='configAndList' sx={{height: '100%', overflowY: 'auto'}}>
            <ConfigPanel
              configPanelOpen={configPanelOpen}
              view={viewData}
              setViewData={setViewData}
              setLoginState={setLoginState}
              setErrorMsg={setErrorMsg}
            />
            <List
              listType='Items'
              view={viewData}
              setViewData={setViewData}
              setLoginState={setLoginState}
              setViewId={handleChangeViewId}
              setAddItem={setAddItem}
              addItem={addItem}
              setErrorMsg={setErrorMsg}
            />
          </Stack>
        ) : (
          <Container className="progress" sx={{display: 'flex', justifyContent: 'center'}}>
            <CircularProgress />
          </Container>
        )}
      </Stack>
      </Container>
    </ThemeProvider>
  );
}

export default App;
