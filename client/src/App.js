import React from "react";
import { createTheme, ThemeProvider, lighten } from "@mui/material/styles";
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
import Collapse from "@mui/material/Collapse";

import List from "./components/List";
import {LoginForm, LoginButton} from "./components/LoginForm";
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
  const [configVisible, toggleConfig] = React.useState(false); 

  const [loginState, setLoginState] = React.useState({open: false});

  React.useEffect(() => {
    //console.log('App useEffect()...');
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
              aria-label="addItem" 
              color="inherit"
              onClick={() => toggleConfig(!configVisible)}
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
            <Stack sx={{backgroundColor: lighten(theme.palette.primary.light, 0.9)}}>
              <Collapse in={configVisible}>
                <Stack sx={{borderBottomWidth: '5px', borderBottomStyle: 'solid', borderBottomColor: theme.palette.primary.main}}>
                  <Typography sx={{fontWeight:'bold', color: theme.palette.primary.main, padding: '8px'}}>List Parameters</Typography>
                  <List
                    type='View'
                    view={{item_template: ''}}
                    list={Globals.listOfAllViews}
                    items={viewData}
                    setLoginState={setLoginState}
                  />
                  <List
                    type='List'
                    view={{item_template: ''}}
                    list={Globals.listOfAllLists}
                    items={listData}
                    setLoginState={setLoginState}
                  />
                </Stack>
              </Collapse>
            </Stack>

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
