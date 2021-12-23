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
  const [data, setData] = React.useState(null);
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
            setData(data);
          }
        }
      },
      tryFirst: true
    });
  }, [viewid]);

  //console.log('Render App (' + (data ? 'filled' : 'empty') + ')...');
  return (
    <ThemeProvider theme={theme}>
      <Container className="App" disableGutters maxWidth="100%">
        <AppBar position="static">
          <Toolbar variant="dense">
            <Box sx={{ flexGrow: 1 }} />
            <LoginButton setLoginState={setLoginState}>Login</LoginButton>
          </Toolbar>
        </AppBar>
        <LoginForm
          loginState={loginState}
          setLoginState={setLoginState}
        />
        {data ? (
          <Stack>
            <Stack sx={{backgroundColor: theme.palette.primary.light, padding:'3px'}}>
              <Typography sx={{fontWeight:'bold', color: theme.palette.primary.contrastText}}>List parameters</Typography>
              <List
                type='View'
                view={{item_template: ''}}
                list={Globals.listOfAllViews}
                items={[Utils.objWithout(data, "_childlist")]}
                setLoginState={setLoginState}
              />
              <List
                type='List'
                view={{item_template: ''}}
                list={Globals.listOfAllLists}
                items={[Utils.objWithout(data._childlist, "items")]}
                setLoginState={setLoginState}
              />
            </Stack>
            <List
              type='Items'
              view={Utils.objWithout(data, "_childlist")}
              list={Utils.objWithout(data._childlist, "items")}
              items={data._childlist.items}
              setLoginState={setLoginState}
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
