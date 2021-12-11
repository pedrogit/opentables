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
import Button from "@mui/material/Button";

import List from "./components/List";
import {LoginForm, LoginButton} from "./components/LoginForm";
const Globals = require("../../client/src/common/globals");

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

  return (
    <ThemeProvider theme={theme}>
      <Container className="App" disableGutters>
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
                template=''
                schema={Globals.listOfAllViews[Globals.listSchemaFieldName]}
                items={[data]}
                setLoginState={setLoginState}
                //sx={{padding: '5px', borderRadius: '5px'}}
              />
              <List
                template=''
                schema={Globals.listOfAllLists[Globals.listSchemaFieldName]}
                items={[data._childlist]}
                setLoginState={setLoginState}
              />
            </Stack>
            <List 
              xsx={{border:'1px solid', borderColor: theme.palette.primary.light}}
              template={data.item_template}
              schema={data._childlist.listschema}
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
