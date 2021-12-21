import React from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import { useTheme, lighten } from "@mui/material/styles";
import Cookies from 'js-cookie'
import jwt from 'jsonwebtoken'
import axios from "axios";

import VisibilityPasswordTextField from "./VisibilityPasswordTextField";
const Errors = require("../common/errors");

function LoginForm({ loginState, setLoginState }) {
  const emailRef = React.useRef();
  const passwordRef = React.useRef();
  const [showInvalidLoginHelper, setShowInvalidLoginHelper] = React.useState(false);
  const [loginButtonDisabled, setloginButtonDisabled] = React.useState(true);
  const theme = useTheme();

  React.useEffect(() => {
    if (loginState.open) {
      // dont' make the values disappear when closing
      emailRef.current.value = null;
      passwordRef.current.value = null;
      emailRef.current.focus();
    }
  }, [loginState.open]);

  const handleClose = () => {
    if (emailRef.current.value === '') {
      // reset the focus on the email to prevent it from flashing
      emailRef.current.value = ' ';
      emailRef.current.focus();
    }
    setLoginState({...loginState, open: false, tryFirst: false});
    setloginButtonDisabled(true);
    setShowInvalidLoginHelper(false);
  };

  const handleKeyDown = (e) => {
    setShowInvalidLoginHelper(false);
    if (e.keyCode === 13) {
      doAction(true);
    }
  };

  const handleChange = () => {
    setloginButtonDisabled(!(emailRef.current.value && passwordRef.current.value));
  }

  var doAction = function (addCredentials = false) {
    if (loginState.action !== undefined) {
      // if credentials were entered add an authorization header
      if (addCredentials) {
        loginState.action = {
          ...loginState.action,
          headers: {
            authorization:
              "Basic " +
              Buffer.from(
                emailRef.current.value + ":" + passwordRef.current.value
              ).toString("base64"),
          },
        };
      }
      axios({ ...loginState.action, withCredentials: true })
        .then((res) => {
          if (res.status === 200 || res.statusText.toUpperCase() === "OK") {
            handleClose();
            loginState.action.callback(true, res.data);
            return true;
          }
        })
        .catch((error) => {
          if (error && 
              error.response && 
              error.response.data && 
              error.response.data.err) {
            if (
              error.response.data.err === Errors.ErrMsg.InvalidUser ||
              error.response.data.err === Errors.ErrMsg.CouldNotLogin
            ) {
              setShowInvalidLoginHelper(true);
            }
            if (error.response.data.err === Errors.ErrMsg.Forbidden) {
              setLoginState({
                ...loginState,
                open: true,
                msg: {
                  ...loginState.msg,
                  iteration: (loginState.msg['iteration'] === undefined ? 0 : loginState.msg['iteration'] + 1)
                },
                tryFirst: false
              });
              //emailRef.current.focus();
            }
          }
          else {
            // show unknown error
          }

          return false;
        });
    }
    return false;
  };

  // try to perform the action before opening
  if (loginState.tryFirst !== undefined && loginState.tryFirst === true) {
    doAction();
  }
// 
  return (
    <Collapse in={loginState.open} sx={{backgroundColor: lighten(theme.palette.primary.light, 0.9)}}>
      <FormControl id="loginform" sx={{width: '100%'}}>
        <Stack 
          spacing={2} 
          padding='5px'
        >
          <Alert severity={
              loginState.msg === undefined || loginState.msg.severity === undefined ? 'info' : loginState.msg.severity
            } 
            color="primary"
            sx={{padding: '0px'}}>
            <AlertTitle>{
              loginState.msg === undefined || loginState.msg.title === undefined ? '' : loginState.msg.title + 
              (loginState.msg.iteration === undefined || loginState.msg.iteration < 1 ? '' : ' (' + loginState.msg.iteration + ')')
            }
            </AlertTitle>
              {
                loginState.msg === undefined || loginState.msg.text === undefined ? '' : loginState.msg.text
              }
          </Alert>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2}
          >
            <TextField
              variant="outlined"
              required
              size="small"
              fullWidth
              label="Email Address"
              inputRef={emailRef}
              onChange={() => handleChange()}
              onKeyDown={(e) => handleKeyDown(e)}
              error={showInvalidLoginHelper}
              InputProps={{id: "emailinput"}}
            />
            <VisibilityPasswordTextField
              variant="outlined"
              size="small"
              required
              fullWidth
              label="Password"
              autoComplete="off"
              inputRef={passwordRef}
              onChange={() => handleChange()}
              onKeyDown={(e) => handleKeyDown(e)}
              error={showInvalidLoginHelper}
            />
            <Stack direction="row" justifyContent="flex-end">
              <ButtonGroup variant="contained" size="small">
                <Button id="logincancelbutton" onClick={() => handleClose()}>Cancel</Button>
                <Button id="loginbutton" onClick={() => doAction(true)} disabled={loginButtonDisabled}>Login</Button>
              </ButtonGroup>
            </Stack>
          </Stack>
          <FormHelperText 
            id="loginhelper" 
            error={showInvalidLoginHelper} 
            sx={{mt: '2px', fontSize: '14px', fontStyle: 'italic'}}
          >
            {showInvalidLoginHelper ? "Invalid email or password..." : " "}
          </FormHelperText>
        </Stack>
      </FormControl>
    </Collapse>
  );
}

function LoginButton({ setLoginState }) {
  const [visible, setVisible] = React.useState(true);
  var user = '';
  var action = 'login';
  var buttonText = 'Login';
  var authtoken = Cookies.get('authtoken');
  if (authtoken) {
     user = jwt.decode(authtoken).email;
     buttonText = 'Logout ' + user;
  }
  return (
    <Button variant="text" color="inherit" onClick={() => {
      if (user) {
        Cookies.remove('authtoken');
        setVisible(!visible);
      }
      else {
        setLoginState({
          open: (action === 'login'), 
          msg: {
            severity: "info",
            title: "Login",
            text:  'Please login with valid credentials...'
          },
          action: {
            method: "get",
            url: "http://localhost:3001/api/opentables/login",
            callback: (success, data) => {
              if (success) {
                setVisible(true);
              }
            }
          },
          tryFirst: (action === 'logout')
        });        
      }
    }}>{buttonText}</Button>
  );
}

export {LoginForm, LoginButton};
