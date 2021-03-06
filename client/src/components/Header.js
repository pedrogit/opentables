import React from "react";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";
import ReplayIcon from "@mui/icons-material/Replay";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Tooltip from "@mui/material/Tooltip";

import { LoginButton } from "./LoginForm";

const Globals = require("../../../common/globals");

function Header({
  viewOwner,
  viewName,
  setAuthAPIRequest,
  toggleOpenConfigPanel,
  configButtonDisabled,
  setAddItem,
  showAddItemButton,
  addItemButtonDisabled,
  setViewId,
  handleReload,
}) {
  const headerRef = React.useRef();
  const theme = useTheme();
  const isSmall = useMediaQuery((thm) => thm.breakpoints.down("sm"));

  return (
    <AppBar id="headerPanel" ref={headerRef} position="static">
      <Stack
        direction="column"
        sx={{
          minHeight: "58px",
        }}
      >
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" sx={{ pl: "5px", pt: "5px" }}>
            {viewOwner && (
              <>
                <Typography
                  id="headerOwner"
                  sx={{
                    color: "#FAA",
                    fontSize: "0.85em",
                    fontStyle: "italic",
                  }}
                >
                  {viewOwner}
                </Typography>
                <Typography
                  sx={{
                    color: "#222",
                    fontSize: "0.85em",
                    fontStyle: "italic",
                    whiteSpace: "nowrap",
                  }}
                >
                  `&lsquo;`s list of
                </Typography>
              </>
            )}
          </Stack>
          <Stack direction="row">
            <LoginButton
              setViewId={setViewId}
              setAuthAPIRequest={setAuthAPIRequest}
              handleReload={handleReload}
              buttons={isSmall}
            />
            <Tooltip title="Home">
              <IconButton
                id="homeButton"
                aria-label="home"
                color="inherit"
                sx={{ p: theme.openTable.buttonPadding }}
                onClick={() => setViewId(Globals.viewOnAllViewViewId)}
              >
                <HomeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                Globals.listProperties +
                (configButtonDisabled ? ` (${Globals.permissionDenied})` : "")
              }
            >
              <span>
                <IconButton
                  id="configPanelOpenButton"
                  aria-label="config panel"
                  color="inherit"
                  sx={{ p: theme.openTable.buttonPadding }}
                  onClick={toggleOpenConfigPanel}
                  disabled={configButtonDisabled}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Reload List">
              <IconButton
                id="reloadListButton"
                aria-label="reload list"
                color="inherit"
                onClick={() => handleReload(true)}
                sx={{ p: theme.openTable.buttonPadding }}
                disableFocusRipple
              >
                <ReplayIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {showAddItemButton && (
              <Tooltip
                title={`Add Item${
                  addItemButtonDisabled ? ` (${Globals.permissionDenied})` : ""
                }`}
              >
                <span>
                  <IconButton
                    id="addItemButton"
                    aria-label="add item"
                    color="inherit"
                    onClick={() => setAddItem(true)}
                    sx={{ p: theme.openTable.buttonPadding }}
                    disableFocusRipple
                    disabled={addItemButtonDisabled}
                  >
                    <AddCircleOutlineIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Stack>
        </Stack>
        <Typography
          id="headerViewName"
          sx={{ fontWeight: "bold", pl: "5px", pb: "5px" }}
        >
          {viewName || "Loading..."}
        </Typography>
      </Stack>
    </AppBar>
  );
}

export default Header;
