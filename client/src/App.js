import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { deepOrange, orange } from "@mui/material/colors";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SettingsIcon from '@mui/icons-material/Settings';

// local imports
import List from "./components/List";
import ConfigPanel from "./ConfigPanel";
import {LoginForm, LoginButton} from "./components/LoginForm";
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

function App({ viewid }) {
  const [viewData, setViewData] = React.useState(null);
  const [listData, setListData] = React.useState(null);
  const [itemsData, setItemsData] = React.useState(null); 
  const [itemsDataUpdated, setItemsDataUpdated] = React.useState(false);
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
        url: "http://localhost:3001/api/opentables/" + viewid,
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
            setItemsData(newItemsData);
            setItemsDataUpdated(!itemsDataUpdated);
          }
        }
      },
      tryFirst: true
    });
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
        <AppBar position="static">
          <Toolbar variant="dense" disableGutters sx={{ml:'5px'}}>
            {(viewData ? (
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
              >
              <Typography sx={{color: 'black', fontStyle: 'italic', mr: '5px'}}>{(viewData.owner + '\'s')}</Typography>
              <Typography sx={{fontWeight:'bold'}}>{viewData.name}</Typography>
              </Stack>
             ) : (
              <Typography>Loading...</Typography>
             ))
             }
            <Box sx={{ flexGrow: 1 }} />
            <LoginButton setLoginState={setLoginState}>Login</LoginButton>
            <IconButton 
              aria-label="configPanel" 
              color="inherit"
          
              onClick={handleOpenConfigPanel}
            >
              <SettingsIcon />
            </IconButton>
            <IconButton 
              aria-label="addItem" 
              color="inherit"
              onClick={handleAddItem}
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <LoginForm sx={{borderBottomWidth: '5px', borderBottomStyle: 'solid', borderBottomColor: theme.palette.primary.main}}
          loginState={loginState}
          setLoginState={setLoginState}
        />
        {(viewData && listData && itemsData) ? (
          <Stack className='configAndList' sx={{height: '100%', overflowY: 'scroll'}}>
            <ConfigPanel
              configPanelOpen={configPanelOpen}
              viewData={viewData}
              listData={listData}
              setLoginState={setLoginState}
            />
            <List
              type='Items'
              view={viewData}
              list={listData}
              items={itemsData}
              setLoginState={setLoginState}
              itemsDataUpdated={itemsDataUpdated}
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
