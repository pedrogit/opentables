import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {LoginButton} from "./LoginForm";

function Header({ 
  viewOwner, 
  viewName, 
  setLoginState, 
  handleOpenConfigPanel, 
  handleAddItem 
}) {
  const [showButtons, setShowButtons] = React.useState(false);
  var buttonsTimeOut = null;

  return (
    <AppBar
      id="headerButtons"
      position="static" 
      onMouseEnter={() => {
        clearTimeout(buttonsTimeOut);
        setShowButtons(true);
      }}
      onMouseLeave={() => {
        buttonsTimeOut = setTimeout(() => setShowButtons(false), 500)
      }}
    >
    <Toolbar variant="dense" disableGutters sx={{ml:'5px'}}>
    {(viewOwner && viewName ? (
        <Stack direction={{ xs: 'column', sm: 'row' }}>
        <Typography sx={{color: 'black', fontStyle: 'italic', mr: '5px'}}>{(viewOwner + '\'s')}</Typography>
        <Typography sx={{fontWeight:'bold'}}>{viewName}</Typography>
        </Stack>
        ) : (
        <Typography>Loading...</Typography>
        ))
    }
    <Box sx={{ flexGrow: 1 }} />
    {showButtons && 
        <Stack direction='row'>
        <LoginButton setLoginState={setLoginState}>Login</LoginButton>
        <IconButton
            id="configPanelOpenButton" 
            aria-label="configPanel" 
            color="inherit"
            onClick={handleOpenConfigPanel}
        >
            <SettingsIcon />
        </IconButton>
        <IconButton
            id="addItemButton" 
            aria-label="addItem" 
            color="inherit"
            onClick={handleAddItem}
        >
            <AddCircleOutlineIcon />
        </IconButton>
        </Stack>
    }
    </Toolbar>
    </AppBar>
  )
}

export default Header;
