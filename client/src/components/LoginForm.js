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
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import Cookies from 'js-cookie'

import VisibilityPasswordTextField from "./VisibilityPasswordTextField";
import getUser from "../clientUtils";
const Errors = require("../common/errors");
const Globals = require("../common/globals");

function LoginForm({ loginState, setLoginState, setErrorMsg, sx }) {
  const emailRef = React.useRef();
  const passwordRef = React.useRef();
  const [showInvalidLoginHelper, setShowInvalidLoginHelper] = React.useState(false);
  const [loginButtonDisabled, setloginButtonDisabled] = React.useState(true);
  const [doSuccessCallback, setDoSuccessCallback] = React.useState({callit: false, data: null});

  const theme = useTheme();

  React.useEffect(() => {
    if (loginState && loginState.open) {
      // don't make the values disappear when closing
      emailRef.current.value = '';
      passwordRef.current.value = '';
      emailRef.current.focus();
    }
  }, [loginState]);

  const handleClose = () => {
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

  // handle callback only after the login dialog has closed (so the edit popover gets rendered at the right position)
  const handleSuccessCallback = () => {
    if (doSuccessCallback.callit) {
      if (loginState.action.callback && typeof loginState.action.callback === 'function') {
        loginState.action.callback(true, doSuccessCallback.data);
      }
      setDoSuccessCallback({callit: false, data: null});
    }
  }

  const doAction = (addCredentials = false) => {
    if (loginState !== undefined && loginState.action !== undefined) {
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
          if (res.status === 200 || res.status === 201 || res.statusText.toUpperCase() === "OK") {
            handleClose();
            if (loginState.open && !res.data) {
              setDoSuccessCallback({callit: true, data: null});
            }
            else {
              if (loginState.action.callback && typeof loginState.action.callback === 'function') {
                loginState.action.callback(true, res.data);
              }
            }
            return true;
          }
        })
        .catch((error) => {
          if (error && 
              error.response && 
              error.response.data && 
              error.response.data.err) {
            // handle bad credentials
            if (
              error.response.data.err === Errors.ErrMsg.InvalidUser ||
              error.response.data.err === Errors.ErrMsg.CouldNotLogin
            ) {
              setShowInvalidLoginHelper(true);
            }
            // good credential but still forbidden (leave login form open)
            else if (error.response.status === 403) {
              setLoginState({
                ...loginState,
                open: true,
                msg: {
                  ...loginState.msg,
                  iteration: (loginState.msg['iteration'] === undefined ? 0 : loginState.msg['iteration'] + 1)
                },
                tryFirst: false
              });
            }
            // other server errors
            else {
              setLoginState({
                open: false,
                tryFirst: false
              });
              setErrorMsg({text: error.response.data.err});
              if (loginState.action.callback && typeof loginState.action.callback === 'function') {
                loginState.action.callback(false, error.response.data.err);
              }
            }
          }
          // connection errors
          else {
            setLoginState({
              open: false,
              tryFirst: false
            });
            setErrorMsg({text: error.message});
            if (loginState.action.callback && typeof loginState.action.callback === 'function') {
              loginState.action.callback(false, error.message);
            }
          }
          return false;
        });
    }
    return false;
  };

  // try to perform the action before opening
  if (loginState !== undefined && loginState.tryFirst !== undefined && loginState.tryFirst === true) {
    doAction();
  }

  return (
    <Stack id='loginForm' sx={{backgroundColor: theme.palette.primary.palebg}}>
      <Collapse 
        in={loginState && loginState.open} 
        
        onExited={handleSuccessCallback}
      >
        <Stack sx={{...sx}}>
          <FormControl sx={{width: '100%'}}>
            <Stack spacing={2} padding='5px'>
              <Alert severity={
                  loginState === undefined || loginState.msg === undefined || loginState.msg.severity === undefined ? 'info' : loginState.msg.severity
                } 
                color="primary"
                sx={{padding: 0, backgroundColor: theme.palette.primary.palebg}}>
                <AlertTitle>{
                  loginState === undefined || loginState.msg === undefined || loginState.msg.title === undefined ? '' : loginState.msg.title + 
                  (loginState.msg.iteration === undefined || loginState.msg.iteration < 1 ? '' : ' (' + loginState.msg.iteration + ')')
                }
                </AlertTitle>
                  {
                    loginState === undefined || loginState.msg === undefined || loginState.msg.text === undefined ? '' : loginState.msg.text
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
                  InputProps={{id: "emailInput", sx:{backgroundColor: 'white'}}}
                  InputLabelProps={{shrink: true}}
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
                  InputLabelProps={{shrink: true}}
                />
                <Stack direction="row" justifyContent="flex-end">
                  <ButtonGroup variant="contained" size="small">
                    <Button id="loginCancelButton" onClick={() => handleClose()}>Cancel</Button>
                    <Button id="loginButton" onClick={() => doAction(true)} disabled={loginButtonDisabled}>Login</Button>
                  </ButtonGroup>
                </Stack>
              </Stack>
              <FormHelperText 
                id="loginHelper" 
                error={showInvalidLoginHelper} 
                sx={{mt: '2px', fontSize: '14px', fontStyle: 'italic'}}
              >
                {showInvalidLoginHelper ? "Invalid email or password..." : " "}
              </FormHelperText>
            </Stack>
          </FormControl>
        </Stack>
      </Collapse>
    </Stack>
  );
}

function LoginButton({ setViewId, setLoginState }) {
  const [visible, setVisible] = React.useState(true);
  var buttonText = 'Login';
  var user = getUser();
  if (user && user !== Globals.allUserName) {
     buttonText = 'Logout ' + user;
  }

  return (
    <>
    <Button
      id='loginLogoutButton'
      variant="text" 
      color="inherit" 
      onClick={() => {
        if (user && user !== Globals.allUserName) {
          Cookies.remove('authtoken');
          setVisible(!visible);
        }
        else {
          setLoginState({
            open: true, 
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
            tryFirst: false
          });
        }
    }}
    >
      {buttonText}
    </Button>
    { buttonText === 'Login' && 
      <Button
        id='signUpButton'
        variant="text" 
        color="inherit"
        onClick={() => {
          setViewId(Globals.signUpViewOnUserListViewId);
        }}
      >Sign&nbsp;Up</Button> }
    </>
  );
}

export {LoginForm, LoginButton};
