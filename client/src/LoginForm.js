import React from "react";
import TextField from '@mui/material/TextField';
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Collapse from "@mui/material/Collapse";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';

import axios from 'axios';

import VisibilityPasswordTextField from './VisibilityPasswordTextField';
const Errors = require('../../client/src/common/errors');

function LoginForm({isVisible, msg, toggleLogin}) {
  const emailRef = React.useRef();
  const passwordRef = React.useRef();
  const [showInvalidLoginHelper, setShowInvalidLoginHelper] = React.useState(false);
  const [performAction, setPerformAction] = React.useState(true);

  msg = {
    severity: 'info',
    title: '',
    msg: '',
    ...msg
  }

  const handleClose = () => {
    emailRef.current.value = null;
    passwordRef.current.value = null;
    toggleLogin(false, '');
    setPerformAction(true);
    setShowInvalidLoginHelper(false);
  }

  const handleKeyDown = (e) => {
    if(e.keyCode === 13){
      doAction();
    }
  }

  var doAction = function() {
    if (msg && msg.action !== undefined) {

      // do not perform the action on the next change of state (only when click on the ok button)
      setPerformAction(false);
      if (emailRef.current.value || passwordRef.current.value) {
        msg.action = {
          ...msg.action, 
          headers: {
            'authorization': 'Basic ' + Buffer.from(emailRef.current.value +':' + passwordRef.current.value).toString('base64')
          }
        }
      }
      axios({...msg.action, withCredentials: true})
      //axios(msg.action)
      .then(res => {
        if (res.status === 200 || res.statusText.toUpperCase() === 'OK') {
          handleClose();
          msg.action.callback(true, res.data);
          return true;
        }
      })
      .catch(error => {
        if (error.response.data.err === Errors.ErrMsg.InvalidUser || 
            error.response.data.err === Errors.ErrMsg.CouldNotLogin) {
          setShowInvalidLoginHelper(true);
        }
        if (error.response.data.err === Errors.ErrMsg.Forbidden) {
          toggleLogin(true, msg);
          emailRef.current.focus();
        }

        return false; 
      });
    }
    return false;
  };

  // try to perform the action before opening
  if (performAction && doAction()) {
    return null;
  }

  return (
    <Collapse in={isVisible}>
      <FormControl>
        <Stack spacing={2}>
          <Alert severity={msg.severity} color='primary'>
            <AlertTitle>{msg.title}</AlertTitle>
            {msg.msg}
          </Alert>
          <Stack direction="row" spacing={2}>
            <TextField 
              variant="outlined"
              required
              size="small"
              fullWidth
              label="Email Address" 
              inputRef={emailRef}
              onChange={() => setShowInvalidLoginHelper(false)}
              onKeyDown={e => handleKeyDown(e)}
              error={showInvalidLoginHelper}
            />
            <VisibilityPasswordTextField
              variant="outlined"
              size="small"
              required
              fullWidth
              label="Password"
              autoComplete="off"
              inputRef={passwordRef}
              onChange={() => setShowInvalidLoginHelper(false)}
              onKeyDown={e => handleKeyDown(e)}
              error={showInvalidLoginHelper}
            />
            <ButtonGroup variant="contained" size="small">
              <Button onClick={() => handleClose()}>Cancel</Button>
              <Button onClick={() => setPerformAction(true)}>Login</Button>
            </ButtonGroup>
          </Stack>
        </Stack>
        <FormHelperText error={showInvalidLoginHelper}>{showInvalidLoginHelper ? 'Invalid email or password...' : ' '}</FormHelperText>
      </FormControl>
    </Collapse>
  );
}

export default LoginForm;

