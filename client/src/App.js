import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { deepOrange, orange } from "@mui/material/colors";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import axios from "axios";

import List from "./components/List";
import LoginForm from "./components/LoginForm";

const theme = createTheme({
  palette: {
    primary: {
      main: deepOrange[900], //#bf360c
      light: deepOrange[900], //#bf360c
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
  const [loginIsVisible, setLoginIsVisible] = React.useState(false);
  const [loginMsg, setLoginMsg] = React.useState(null);

  React.useEffect(() => {
    toggleLogin(false, {
      severity: "warning",
      title: "Permission denied",
      msg:
        'You do not have permissions to view this list. Please login with valid credentials...',
      action: {
        method: "get",
        url: "http://localhost:3001/api/opentables/" + viewid,
        callback: (success, data) => {
          if (success) {
            setData(data);
          }
        }
      },
    });
  }, [viewid]);

  const toggleLogin = (open, msg) => {
    setLoginIsVisible(open);
    setLoginMsg(msg);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container className="App" maxWidth="sm">
        <LoginForm
          isVisible={loginIsVisible}
          msg={loginMsg}
          toggleLogin={toggleLogin}
        />
        {data ? (
          <List
            template={data.item_template}
            schema={data._childlist.listschema}
            items={data._childlist.items}
            toggleLogin={toggleLogin}
          />
        ) : (
          <CircularProgress />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
