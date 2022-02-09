import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { deepOrange, orange } from "@mui/material/colors";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";


// local imports
import List from "./components/List";
import Header from "./components/Header";

import ConfigPanel from "./components/ConfigPanel";
import {LoginForm} from "./components/LoginForm";
import getUser from "./clientUtils";
const Globals = require("../../client/src/common/globals");
const Utils = require("./common/utils");

const theme = createTheme({
  palette: {
    primary: {
      main: deepOrange[900], //#bf360c
      //light: deepOrange[900], //#bf360c
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

function App({ initialViewid }) {
  const [viewid, setViewId] = React.useState(Utils.getURLParam('viewid') ? Utils.getURLParam('viewid') : initialViewid);

  const [viewData, setViewData] = React.useState(null);
  const [listData, setListData] = React.useState(null);
  const [itemsData, setItemsData] = React.useState(null); 
  const [configPanelOpen, toggleConfigPanel] = React.useState(false);
  const [loginState, setLoginState] = React.useState({open: false});

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
            setListData(Utils.objWithout(data._childlist, "items"));
            setItemsData(data._childlist.items);
          }
        }
      },
      tryFirst: true
    });
  }, [viewid]);

  const handleAddItem = () => {
    setLoginState({
      open: false,
      msg: {
        severity: "warning",
        title: "Permission denied",
        text: 'You do not have permissions to add items to this list. Please login with valid credentials...'
      },
      action: {
        method: "post",
        url: "http://localhost:3001/api/opentables/" + listData._id,
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
    var authView = Utils.validatePerm(
      user,
      viewData[Globals.ownerFieldName],
      viewData[Globals.readWritePermFieldName],
      null,
      null,
      false
    );
    var authList = Utils.validatePerm(
      user,
      listData[Globals.ownerFieldName],
      listData[Globals.readWritePermFieldName],
      null,
      null,
      false
    );
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
      <Container className="App" disableGutters maxWidth="100%" sx={{height: "100%"}}>
      <Stack sx={{height: "100%"}}>
        <Header 
          viewOwner={viewData ? viewData.owner : ''} 
          viewName={viewData ? viewData.name : ''}
          setLoginState={setLoginState} 
          handleOpenConfigPanel={handleOpenConfigPanel} 
          handleAddItem={handleAddItem}
        />
        <LoginForm sx={{borderBottomWidth: '5px', borderBottomStyle: 'solid', borderBottomColor: theme.palette.primary.main}}
          loginState={loginState}
          setLoginState={setLoginState}
        />
        {(viewData && listData && itemsData) ? (
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
              setViewId={setViewId}
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
