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
import { useTheme } from "@mui/material/styles";
import useMediaQuery from '@mui/material/useMediaQuery';
import Tooltip from '@mui/material/Tooltip';

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
  const headerRef = React.useRef();
  const theme = useTheme();
  const small = useMediaQuery((xtheme) => xtheme.breakpoints.down('sm'));

  var buttonsTimeOut = null;

  return (
    <AppBar
      id="headerButtons"
      ref={headerRef}
      position="static" 
      onMouseEnter={() => {
        clearTimeout(buttonsTimeOut);
        setShowButtons(true);
      }}
      onMouseLeave={() => {
        buttonsTimeOut = setTimeout(() => setShowButtons(false), 500)
      }}
    >
    <Toolbar variant="dense" disableGutters sx={{ml:'5px', minHeight: '52px'}}>
    {(viewOwner && viewName ? (
        <Stack direction='column'>
          <Stack direction='row'>
            <Typography sx={{color: '#222', fontSize: "0.8em", fontStyle: "italic"}}>{viewOwner}</Typography><Typography sx={{color: '#FAA', fontSize: "0.8em", fontStyle: "italic"}}>'s list of</Typography>
          </Stack>
          <Typography sx={{fontWeight:'bold'}}>{viewName}</Typography>
        </Stack>
      ) : (
        <Typography sx={{color: '#FAA'}}>Loading...</Typography>
      ))
    }
    <Box sx={{ flexGrow: 1 }}/>
      {showButtons && 
        <Stack direction='row'>
          <LoginButton 
            setViewId={setViewId} 
            setLoginState={setLoginState}
            buttons={small}
          />
          <Tooltip title="Home">
            <IconButton
              id="homeButton" 
              aria-label="home" 
              color="inherit"
              onClick={() => setViewId(Globals.viewOnAllViewViewId)}
            >
              <HomeIcon fontSize="small"/>
            </IconButton>
          </Tooltip>
          <Tooltip title="List Settings">
            <IconButton
                id="configPanelOpenButton" 
                aria-label="config panel" 
                color="inherit"
                onClick={handleOpenConfigPanel}
            >
                <SettingsIcon fontSize="small"/>
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Item">
            <IconButton
                id="addItemButton" 
                aria-label="add item" 
                color="inherit"
                onClick={() => setAddItem(true)}
            >
                <AddCircleOutlineIcon fontSize="small"/>
            </IconButton>
          </Tooltip>
        </Stack>
      }

    </Toolbar>
    </AppBar>
  )
}

export default Header;
