import React from "react";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { useTheme } from "@mui/material/styles";
import Collapse from "@mui/material/Collapse";
import IconButton from '@mui/material/IconButton';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';


function ErrorPanel({ errorMsg, setErrorMsg, autoClose, closeButton }) {
  const theme = useTheme();
  var closeTimeOut;
  
  if (errorMsg !== null && errorMsg.text && (!errorMsg.open || errorMsg.open === false)) {
    setTimeout(() => {
      setErrorMsg({...errorMsg, open: true});
      if (autoClose) {
        clearTimeout(closeTimeOut);
        closeTimeOut = setTimeout(() => setErrorMsg({open: false}), 4000);
      }
    }, 300);
  }

  return (
    <Stack sx={{position: 'relative'}}>
      <Collapse in={errorMsg && errorMsg.open && errorMsg.open === true} xtimeout={3000}>
      <Stack sx={{
        position: 'relative', 
        borderBottomWidth: '5px', 
        borderBottomStyle: 'solid', 
        borderBottomColor: theme.palette.primary.main
      }}>
        {closeButton &&
          <IconButton
            sx = {{position: 'absolute', top: '1px', right: '1px'}}
            id="closeErrorMsgButton"
            aria-label="closeErrorMsgButton" 
            color="inherit"
            onClick={() => setErrorMsg({...errorMsg, open: false})}
          >
            <HighlightOffIcon />
          </IconButton>
        }
        <Alert 
            severity={errorMsg && errorMsg.severity ? errorMsg.severity : 'error'} 
            color="primary"
            sx={{padding: '5px'}}
        >
        <AlertTitle>{errorMsg && errorMsg.title ? errorMsg.title : 'Error'}</AlertTitle>
        {(errorMsg && errorMsg.text) ? errorMsg.text : <span> </span>}
        </Alert>
        </Stack>
      </Collapse>
    </Stack>
  )
}

ErrorPanel.defaultProps = {
  autoClose: true,
  closeButton: false
}

export default ErrorPanel;
