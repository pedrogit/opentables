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
  //const [data, setData] = React.useState(null);
  const [viewData, setViewData] = React.useState(null);
  const [listData, setListData] = React.useState(null);
  const [itemsData, setItemsData] = React.useState(null); 
  const [itemsDataUpdated, setItemsDataUpdated] = React.useState(false);

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
            //setData(data);
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
            //data._childlist.items.unshift(newitem);
            //setData(data);
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
      <Container className="App" disableGutters maxWidth="100%">
        <AppBar position="static">
          <Toolbar variant="dense">
            <Box sx={{ flexGrow: 1 }} />
            <IconButton 
              aria-label="addItem" 
              color="inherit"
              onClick={handleAddItem}
            >
              <AddCircleOutlineIcon />
            </IconButton>
            <LoginButton setLoginState={setLoginState}>Login</LoginButton>
          </Toolbar>
        </AppBar>
        <LoginForm
          loginState={loginState}
          setLoginState={setLoginState}
        />
        {(viewData && listData && itemsData) ? (
          <Stack>
            <Stack sx={{backgroundColor: theme.palette.primary.light, padding:'3px'}}>
              <Typography sx={{fontWeight:'bold', color: theme.palette.primary.contrastText}}>List parameters</Typography>
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
      </Container>
    </ThemeProvider>
  );
}

export default App;
