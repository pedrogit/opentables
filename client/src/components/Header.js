import React from "react";
import AppBar from "@mui/material/AppBar";
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
  const headerRef = React.useRef();
  const theme = useTheme();
  const small = useMediaQuery((thm) => thm.breakpoints.down('sm'));

  return (
    <AppBar
      id="headerButtons"
      ref={headerRef}
      position="static" 
    >
      <Stack 
        direction='column'
        sx={{
          minHeight: '58px'
        }}
      >
        <Stack 
          direction='row' 
          justifyContent="space-between" 
        >
          <Stack direction='row' sx={{p:'5px'}}>
            {viewOwner &&
                <><Typography 
                  sx={{
                    color: '#FAA', 
                    fontSize: "0.8em", 
                    fontStyle: "italic"
                  }}>{viewOwner}</Typography><Typography 
                    sx={{
                      color: '#222', 
                      fontSize: "0.8em", 
                      fontStyle: "italic", 
                      whiteSpace: "nowrap"}}>'s list of</Typography></>
            }
          </Stack>
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
                sx={{p: theme.openTable.buttonPadding}}
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
                  sx={{p: theme.openTable.buttonPadding}}
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
                  sx={{p: theme.openTable.buttonPadding}}
                  disableFocusRipple={true}
              >
                <AddCircleOutlineIcon fontSize="small"/>
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
          <Typography sx={{fontWeight:'bold', pl:'5px', pb:'5px'}}>{viewName ? viewName : "Loading..."}</Typography>
      </Stack>
    </AppBar>
  )
}

export default Header;
