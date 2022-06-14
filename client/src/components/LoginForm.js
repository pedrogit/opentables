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
import Cookies from "js-cookie";
import IconButton from "@mui/material/IconButton";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import Tooltip from "@mui/material/Tooltip";

import VisibilityPasswordTextField from "./VisibilityPasswordTextField";
import { getUser, getScriptBaseURL } from "../clientUtils";

const Errors = require("../../../common/errors");
const Globals = require("../../../common/globals");

function LoginForm({ authAPIRequest, setAuthAPIRequest, setErrorMsg, sx }) {
  const emailRef = React.useRef();
  const passwordRef = React.useRef();
  const [showInvalidLoginHelper, setShowInvalidLoginHelper] =
    React.useState(false);
  const [loginButtonDisabled, setLoginButtonDisabled] = React.useState(true);
  const [doSuccessCallback, setDoSuccessCallback] = React.useState({
    callit: false,
    data: null,
  });

  const theme = useTheme();

  React.useEffect(() => {
    if (authAPIRequest && !authAPIRequest.tryBeforeShowLogin) {
      // don't make the values disappear when closing
      emailRef.current.value = "";
      passwordRef.current.value = "";
      emailRef.current.focus();
    }
  }, [authAPIRequest]);

  const handleClose = () => {
    setAuthAPIRequest({
      tryBeforeShowLogin: true,
      warningMsg: authAPIRequest.warningMsg,
      callback: authAPIRequest.callback,
    });
    setLoginButtonDisabled(true);
    setShowInvalidLoginHelper(false);
  };

  const handleChange = () => {
    setLoginButtonDisabled(
      !(emailRef.current.value && passwordRef.current.value)
    );
  };

  // handle callback only after the login dialog has closed (so the edit popover gets rendered at the right position)
  const handleSuccessCallback = () => {
    if (doSuccessCallback.callit) {
      if (
        authAPIRequest.callback &&
        typeof authAPIRequest.callback === "function"
      ) {
        authAPIRequest.callback(true, doSuccessCallback.data);
      }
      setDoSuccessCallback({ callit: false, data: null });
    }
  };

  const doAction = (addCredentials = false) => {
    if (
      authAPIRequest !== undefined &&
      authAPIRequest.method &&
      authAPIRequest.method !== null
    ) {
      const scriptURL = getScriptBaseURL();
      axios({
        method: authAPIRequest.method,
        url: `${scriptURL}api/opentables/${authAPIRequest.urlParams}`,
        data: authAPIRequest.data,
        headers: addCredentials && {
          authorization: `Basic ${Buffer.from(
            `${emailRef.current.value}:${passwordRef.current.value}`
          ).toString("base64")}`,
        },
        withCredentials: true,
      })
        .then((res) => {
          if (
            res.status === 200 ||
            res.status === 201 ||
            res.statusText.toUpperCase() === "OK"
          ) {
            handleClose();
            if (!authAPIRequest.tryBeforeShowLogin && !res.data) {
              setDoSuccessCallback({ callit: true, data: null });
            } else if (
              authAPIRequest.callback &&
              typeof authAPIRequest.callback === "function"
            ) {
              authAPIRequest.callback(true, res.data);
            }
            return true;
          }
          return false;
        })
        .catch((error) => {
          if (
            error &&
            error.response &&
            error.response.data &&
            error.response.data.err
          ) {
            // handle bad credentials
            if (
              error.response.data.err === Errors.ErrMsg.InvalidUser ||
              error.response.data.err === Errors.ErrMsg.CouldNotLogin
            ) {
              setShowInvalidLoginHelper(true);
            }
            // good credential but still forbidden (leave login form open)
            else if (error.response.status === 403) {
              setAuthAPIRequest({
                ...authAPIRequest,
                tryBeforeShowLogin: false,
                displayCount:
                  authAPIRequest.displayCount === undefined
                    ? 0
                    : authAPIRequest.displayCount + 1,
              });
            }
            // other server errors
            else {
              setAuthAPIRequest({
                tryBeforeShowLogin: false,
              });
              setErrorMsg({ text: error.response.data.err });
              if (
                authAPIRequest.callback &&
                typeof authAPIRequest.callback === "function"
              ) {
                authAPIRequest.callback(false, error.response.data.err);
              }
            }
          }
          // connection errors
          else {
            setAuthAPIRequest({
              tryBeforeShowLogin: false,
            });
            setErrorMsg({ text: error.message });
            if (
              authAPIRequest.callback &&
              typeof authAPIRequest.callback === "function"
            ) {
              authAPIRequest.callback(false, error.message);
            }
          }
          return false;
        });
    }
    return false;
  };

  const handleKeyDown = (e) => {
    setShowInvalidLoginHelper(false);
    if (e.keyCode === 13) {
      doAction(true);
    }
  };

  // try to perform the action before opening
  if (
    authAPIRequest !== undefined &&
    authAPIRequest.tryBeforeShowLogin !== undefined &&
    authAPIRequest.tryBeforeShowLogin === true
  ) {
    doAction();
  }

  return (
    <Stack
      id="loginForm"
      sx={{ backgroundColor: theme.palette.primary.palebg }}
    >
      <Collapse
        in={
          authAPIRequest &&
          !authAPIRequest.tryBeforeShowLogin &&
          authAPIRequest.method &&
          authAPIRequest.method !== null
        }
        onExited={handleSuccessCallback}
      >
        <Stack sx={{ ...sx }}>
          <FormControl sx={{ width: "100%" }}>
            <Stack spacing={2} padding="5px">
              <Alert
                severity={authAPIRequest.warningMsg ? "warning" : "info"}
                color="primary"
                sx={{
                  padding: 0,
                  backgroundColor: theme.palette.primary.palebg,
                }}
              >
                <AlertTitle>
                  {(authAPIRequest.warningMsg
                    ? Globals.permissionDenied
                    : "Login") +
                    (authAPIRequest.displayCount &&
                    authAPIRequest.displayCount > 1
                      ? ` (${authAPIRequest.displayCount})`
                      : "")}
                </AlertTitle>
                {
                  `${
                    authAPIRequest.warningMsg
                      ? `You do not have permission to ${authAPIRequest.warningMsg}. `
                      : ""
                  }Please login with valid credentials...`
                  // authAPIRequest.msg === undefined || authAPIRequest.msg.text === undefined ? '' : authAPIRequest.msg.text
                }
              </Alert>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
                  InputProps={{
                    id: "emailInput",
                    sx: { backgroundColor: "white" },
                  }}
                  InputLabelProps={{ shrink: true }}
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
                  InputLabelProps={{ shrink: true }}
                />
                <Stack direction="row" justifyContent="flex-end">
                  <ButtonGroup variant="contained" size="small">
                    <Button
                      id="loginCancelButton"
                      onClick={() => handleClose()}
                    >
                      Cancel
                    </Button>
                    <Button
                      id="loginButton"
                      onClick={() => doAction(true)}
                      disabled={loginButtonDisabled}
                    >
                      Login
                    </Button>
                  </ButtonGroup>
                </Stack>
              </Stack>
              <FormHelperText
                id="loginHelper"
                error={showInvalidLoginHelper}
                sx={{ mt: "2px", fontSize: "14px", fontStyle: "italic" }}
              >
                {showInvalidLoginHelper
                  ? Errors.ErrMsg.InvalidEmailPassword
                  : " "}
              </FormHelperText>
            </Stack>
          </FormControl>
        </Stack>
      </Collapse>
    </Stack>
  );
}

function LoginButton({ setViewId, setAuthAPIRequest, handleReload, buttons }) {
  const theme = useTheme();

  let loginButtonText = "Login";
  const user = getUser();
  console.log(`Logged ${user}`);
  if (user && user !== Globals.allUserName) {
    loginButtonText = `Logout ${user}`;
  }

  const handleLoginLogout = () => {
    if (user && user !== Globals.allUserName) {
      Cookies.remove("authtoken");
      handleReload();
    } else {
      setAuthAPIRequest({
        method: "get",
        tryBeforeShowLogin: false,
        urlParams: "login",
        callback: (success) => {
          if (success) {
            handleReload(true);
          }
        },
      });
    }
  };

  let loginButton = (
    <Button
      id="loginLogoutButton"
      variant="text"
      color="inherit"
      sx={{ p: theme.openTable.buttonPadding, lineHeight: "normal" }}
      onClick={handleLoginLogout}
    >
      {loginButtonText}
    </Button>
  );

  let signUpButton = (
    <Button
      id="signUpButton"
      variant="text"
      color="inherit"
      sx={{ p: theme.openTable.buttonPadding, lineHeight: "normal" }}
      onClick={() => {
        setViewId(Globals.signUpViewOnUserListViewId);
      }}
    >
      Sign&nbsp;Up
    </Button>
  );

  if (buttons) {
    loginButton = (
      <IconButton
        id="loginLogoutButton"
        aria-label="home"
        color="inherit"
        sx={{ p: theme.openTable.buttonPadding }}
        onClick={handleLoginLogout}
      >
        {loginButtonText === "Login" ? (
          <Tooltip title="Login">
            <LoginIcon fontSize="small" />
          </Tooltip>
        ) : (
          <Tooltip title="Logout">
            <LogoutIcon fontSize="small" />
          </Tooltip>
        )}
      </IconButton>
    );

    signUpButton = (
      <Tooltip title="Sign Up">
        <IconButton
          id="signUpButton"
          aria-label="home"
          color="inherit"
          sx={{ p: theme.openTable.buttonPadding }}
          onClick={() => {
            setViewId(Globals.signUpViewOnUserListViewId);
          }}
        >
          <HowToRegIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <>
      {loginButton}
      {loginButtonText === "Login" && signUpButton}
    </>
  );
}

export { LoginForm, LoginButton };
