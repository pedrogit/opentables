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
import axios from "axios";
import Cookies from 'js-cookie'

import VisibilityPasswordTextField from "./VisibilityPasswordTextField";
import getUser from "../clientUtils";
const Errors = require("../common/errors");

function LoginForm({ loginState, setLoginState, sx }) {
  const emailRef = React.useRef();
  const passwordRef = React.useRef();
  const [showInvalidLoginHelper, setShowInvalidLoginHelper] = React.useState(false);
  const [loginButtonDisabled, setloginButtonDisabled] = React.useState(true);
  const [doSuccessCallback, setDoSuccessCallback] = React.useState({doit: false, data: null});

  const theme = useTheme();

  React.useEffect(() => {
    if (loginState && loginState.open) {
      // dont' make the values disappear when closing
      emailRef.current.value = '';
      passwordRef.current.value = '';
      emailRef.current.focus();
    }
  }, [loginState]);

  const handleClose = () => {
    //if (loginState.open) {
      setLoginState({...loginState, open: false, tryFirst: false});
      setloginButtonDisabled(true);
      setShowInvalidLoginHelper(false);
    //}
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

  // handle callback only after the login dialog has closed (so the edit popover gets rendred at the right location)
  const handleSuccessCallback = () => {
    console.log('doSuccessCallback=' + doSuccessCallback.doit);
    if (doSuccessCallback.doit) {
      console.log('doSuccessCallback');
      loginState.action.callback(true, doSuccessCallback.data);
      setDoSuccessCallback({doit: false, data: null});
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
              setDoSuccessCallback({doit: true, data: res.data});
            }
            else {
              loginState.action.callback(true, res.data);
            }
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
  if (loginState !== undefined && loginState.tryFirst !== undefined && loginState.tryFirst === true) {
    doAction();
  }

  return (
    <Stack className='loginForm' sx={{backgroundColor: lighten(theme.palette.primary.light, 0.9)}}>
      <Collapse 
        in={loginState && loginState.open} 
        
        onExited={handleSuccessCallback}
      >
        <Stack sx={{...sx}}>
          <FormControl id="loginform" sx={{width: '100%'}}>
            <Stack 
              spacing={2} 
              padding='5px'
            >
              <Alert severity={
                  loginState === undefined || loginState.msg === undefined || loginState.msg.severity === undefined ? 'info' : loginState.msg.severity
                } 
                color="primary"
                sx={{padding: '0px'}}>
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
                  InputProps={{id: "emailinput", sx:{backgroundColor: 'white'}}}
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
        </Stack>
      </Collapse>
    </Stack>
  );
}

function LoginButton({ setLoginState }) {
  const [visible, setVisible] = React.useState(true);
  var action = 'login';
  var buttonText = 'Login';
  var user = getUser();
  if (user) {
     buttonText = 'Logout ' + user;
  }

  return (
    <Button
      id='loginlogoutbutton'
      variant="text" 
      color="inherit" 
      onClick={() => {
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
    }}
    >
      {buttonText}
    </Button>
  );
}

export {LoginForm, LoginButton};
