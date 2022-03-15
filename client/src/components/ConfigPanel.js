import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import { useTheme } from "@mui/material/styles";

// local imports
import List from "./List";
const Globals = require("../common/globals");

function ConfigPanel({
  configPanelOpen,
  view,
  list,
  setLoginState,
  setErrorMsg
}) {
  const theme = useTheme();

  return (
    <Stack sx={{backgroundColor: theme.palette.primary.palebg}}>
      <Collapse in={configPanelOpen}>
        <Stack sx={{borderBottomWidth: '5px', borderBottomStyle: 'solid', borderBottomColor: theme.palette.primary.main}}>
          <Typography sx={{fontWeight:'bold', color: theme.palette.primary.main, padding: '8px'}}>List Parameters</Typography>
          <List
            listType='View'
            view={{item_template: ''}}
            list={{
              ...Globals.listOfAllViews,
              items: view ? [view] : []
            }}
            setLoginState={setLoginState}
            setErrorMsg={setErrorMsg}
          />
          <List
            listType='List'
            view={{item_template: ''}}
            list={{
              ...Globals.listOfAllLists,
              items: list ? [list] : []
            }}
            setLoginState={setLoginState}
            setErrorMsg={setErrorMsg}
          />
        </Stack>
      </Collapse>
    </Stack>
  )
}

export default ConfigPanel;
