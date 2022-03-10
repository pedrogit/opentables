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
});

function App({ initialViewid, appid }) {
  const [viewid, setViewId] = React.useState(BrowserHistory.getViewIdFromURL(appid) ? BrowserHistory.getViewIdFromURL(appid) : initialViewid);

  const [viewData, setViewData] = React.useState(null);
  const [listData, setListData] = React.useState(null);
  const [itemsData, setItemsData] = React.useState(null); 
  const [configPanelOpen, toggleConfigPanel] = React.useState(false);
  const [loginState, setLoginState] = React.useState({open: false});
  const [errorMsg, setErrorMsg] = React.useState(null);

  const handleChangeViewId = React.useCallback(
    (viewid) => {
      setErrorMsg({...errorMsg, open: false});
      toggleConfigPanel(false);
      setViewId(viewid);
    }, [errorMsg, setErrorMsg, setViewId, toggleConfigPanel]
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
        title: "Permission denied",
        text: 'You do not have permissions to view this list. Please login with valid credentials...'
      },
      action: {
        method: "get",
        url: "http://localhost:3001/api/opentables/" + (viewid ? viewid : ''),
        callback: (success, data) => {
          if (success) {
            setViewData(Utils.objWithout(data, "_childlist"));
            BrowserHistory.pushHistoryState(appid, viewid);

            if (data._childlist) {
              setListData(Utils.objWithout(data._childlist, "items"));
              setItemsData(data._childlist.items);
            }
            else {
              setListData(null);
              setItemsData(null);
              setErrorMsg({text: "No list is associated to this view..."});
            }
          }
        }
      },
      tryFirst: true
    });
  }, [viewid, appid]);


  const handleAddItem = () => {
    if (listData) {
      setLoginState({
        open: false,
        msg: {
          severity: "warning",
          title: "Permission denied",
          text: 'You do not have permissions to add items to this list. Please login with valid credentials...'
        },
        action: {
          method: "post",
          url: "http://localhost:3001/api/opentables/" + listData[Globals.itemIdFieldName],
          callback: (success, newitem) => {
            if (success) {
              var newItemsData = itemsData;
              newItemsData.unshift(newitem);
              setItemsData([...newItemsData]);
            }
          }
        },
        tryFirst: true
      });
    }
    else {
      setErrorMsg({text: "No list is associated to this view. You can not add items..."});
    }
  };

  const handleDeleteItem = (itemid, callback) => {
    setLoginState({
      open: false,
      msg: {
        severity: "warning",
        title: "Permission denied",
        text:
        'You do not have permissions to delete items from this list. Please login with valid credentials...',
      },
      action: {
        method: "delete",
        url: "http://localhost:3001/api/opentables/" + itemid,
        callback: (success, data) => {
          if (success) {
            var newItemsData = itemsData;
            newItemsData = newItemsData.filter(item => item[Globals.itemIdFieldName] !== itemid);
            setItemsData([...newItemsData]);
          }
        }
      },
      tryFirst: true
    });
    return false;
  };

  const handleOpenConfigPanel = () => {
    var user = getUser();
    var authView = Utils.validateRWPerm({
      user: user,
      item: viewData,
      throwError: false
    });
    var authList = true;
    if (listData) {
      authList = Utils.validateRWPerm({
        user: user,
        list: listData,
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
          handleAddItem={handleAddItem}
          setViewId={handleChangeViewId}
        />
        <ErrorPanel errorMsg={errorMsg} setErrorMsg={setErrorMsg}/>
        <LoginForm sx={{borderBottomWidth: '5px', borderBottomStyle: 'solid', borderBottomColor: theme.palette.primary.main}}
          loginState={loginState}
          setLoginState={setLoginState}
          setErrorMsg={setErrorMsg}
        />
        {(viewData || listData || itemsData) ? (
          <Stack className='configAndList' sx={{height: '100%', overflowY: 'auto'}}>
            <ConfigPanel
              configPanelOpen={configPanelOpen}
              viewData={viewData}
              listData={listData}
              setLoginState={setLoginState}
              handleDeleteItem={handleDeleteItem}
            />
            <List
              type='Items'
              view={viewData}
              list={listData}
              items={itemsData}
              setLoginState={setLoginState}
              handleDeleteItem={handleDeleteItem}
              setViewId={handleChangeViewId}
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
