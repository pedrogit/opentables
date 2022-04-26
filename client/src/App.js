import React from "react";
import { createTheme, ThemeProvider, lighten } from "@mui/material/styles";
import { deepOrange, orange } from "@mui/material/colors";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

// local imports
import List from "./components/List";
import Header from "./components/Header";

import ConfigPanel from "./components/ConfigPanel";
import ErrorPanel from "./components/ErrorPanel";
import {LoginForm} from "./components/LoginForm";
import getUser from "./clientUtils";
import * as BrowserHistory from "./browserHistory";
const Schema = require("../../client/src/common/schema");
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
  const [viewData, setViewData] = React.useState(null);
  const [showConfigPanel, setShowConfigPanel] = React.useState(false);
  const [loginState, setLoginState] = React.useState({open: false});
  const [errorMsg, setErrorMsg] = React.useState(null);
  const [addItem, setAddItem] = React.useState(false);
  const [reload, setReload] = React.useState(false);
  const [refresh, setRefresh] = React.useState(false);

  // handleReload is necessary because the viewid is not 
  // available where handleReload is called
  const handleReload = (toggleCfgPanel) => {
    handleChangeViewId(viewid, toggleCfgPanel);
  };

  const handleRefresh = React.useCallback(
    () => {
      setRefresh(!refresh);
    }, [refresh, setRefresh]
  );

  const handleChangeViewId = React.useCallback(
    (newViewid, toggleCfgPanel) => {
      setAddItem(false);
      setErrorMsg({open: false});
      if (toggleCfgPanel === undefined) {
        setShowConfigPanel(false);
      }
      if (viewData) {
        // make the list of items to flash to nothing before reloading
        setViewData({
          ...Utils.objWithout(viewData, Globals.childlistFieldName),
          [Globals.childlistFieldName]: Utils.objWithout(viewData[Globals.childlistFieldName], Globals.itemsFieldName)
        });
      }
      setViewId(newViewid);
      setReload(!reload);
    }, [viewData, setAddItem, setErrorMsg, setShowConfigPanel, setViewData, setViewId, reload]
  );

  React.useEffect(() => {
    BrowserHistory.registerApp(appid, handleChangeViewId);
  }, [appid, handleChangeViewId]);

  React.useEffect(() => {
    // initial loading of list data
    setLoginState({
      open: false,
      msg: {
        severity: "warning",
        title: Globals.permissionDenied,
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
  }, [reload, viewid, appid]);

  const toggleOpenConfigPanel = React.useCallback(
    () => {
        setShowConfigPanel(!showConfigPanel);
    }, [showConfigPanel, setShowConfigPanel]
  );

  //console.log('Render App (' + (data ? 'filled' : 'empty') + ')...');
  return (
    <ThemeProvider theme={theme}>
      <Container id={"otapp_" + appid} disableGutters maxWidth="100%" sx={{height: "100%"}}>
      <Stack sx={{height: "100%"}}>
        <Header 
          viewOwner={viewData ? viewData.owner : ''} 
          viewName={viewData ? viewData.name : ''}
          setLoginState={setLoginState} 
          toggleOpenConfigPanel={toggleOpenConfigPanel}
          configButtonDisabled={
            !viewData ||
            !Utils.validateRPerm({
              user: getUser(),
              list: Globals.listOfAllViews,
              item: viewData
            })
          }
          setAddItem={setAddItem}
          showAddItemButton={
            viewData && 
            viewData[Globals.addItemModeFieldName] !== Globals.addWithPersistentFormAndItems && 
            viewData[Globals.addItemModeFieldName] !== Globals.addWithPersistentFormNoItems
          }
          addItemButtonDisabled={
            !viewData ||
            !(Utils.validateCPerm({
              user: getUser(),
              list: viewData[Globals.childlistFieldName]
            }))
          }
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
          <>
          <ConfigPanel
            showConfigPanel={showConfigPanel}
            setShowConfigPanel={setShowConfigPanel}
            view={viewData}
            setViewData={setViewData}
            setLoginState={setLoginState}
            setErrorMsg={setErrorMsg}
            handleReload={handleReload}
          />
          <Box sx={{height: '100%', overflowY: 'auto'}}>
            <List
              listType={Globals.itemListType}
              view={viewData}
              parsedSchema={new Schema(viewData[Globals.childlistFieldName][Globals.listSchemaFieldName])}
              setViewData={setViewData}
              setLoginState={setLoginState}
              setViewId={handleChangeViewId}
              handleReload={handleReload}
              handleRefresh={handleRefresh}
              setAddItem={setAddItem}
              addItem={addItem}
              setErrorMsg={setErrorMsg}
            />
          </Box>
          </>
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
