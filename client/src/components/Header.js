import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {LoginButton} from "./LoginForm";
const Globals = require("../common/globals");

function Header({ 
  viewOwner, 
  viewName, 
  setLoginState, 
  handleOpenConfigPanel, 
  setAddItem,
  setViewId
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
    <Toolbar variant="dense" disableGutters sx={{ml:'5px', minHeight: '38px'}}>
    {(viewOwner && viewName ? (
        <Stack direction={{ xs: 'column', sm: 'row' }}>
        <Typography sx={{color: '#FAA', mr: '5px'}}>{(viewOwner + '\'s list of')}</Typography>
        <Typography sx={{fontWeight:'bold'}}>{viewName}</Typography>
        </Stack>
        ) : (
        <Typography sx={{color: '#FAA'}}>Loading...</Typography>
        ))
    }
    <Box sx={{ flexGrow: 1 }} />
    {showButtons && 
        <Stack direction='row'>
        <LoginButton setViewId={setViewId} setLoginState={setLoginState} />
        <IconButton
            id="homeButton" 
            aria-label="home" 
            color="inherit"
            onClick={() => setViewId(Globals.viewOnAllViewViewId)}
        >
          <HomeIcon fontSize="small"/>
        </IconButton>
        <IconButton
            id="configPanelOpenButton" 
            aria-label="config panel" 
            color="inherit"
            onClick={handleOpenConfigPanel}
        >
            <SettingsIcon fontSize="small"/>
        </IconButton>
        <IconButton
            id="addItemButton" 
            aria-label="add item" 
            color="inherit"
            onClick={() => setAddItem(true)}
        >
            <AddCircleOutlineIcon fontSize="small"/>
        </IconButton>
        </Stack>
    }
    </Toolbar>
    </AppBar>
  )
}

export default Header;
