import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import { useTheme, lighten } from "@mui/material/styles";

// local imports
import List from "./components/List";
const Globals = require("../../client/src/common/globals");

function ConfigPanel({ configPanelOpen, viewData, listData, setLoginState }) {
  const theme = useTheme();

  return (
    <Stack sx={{backgroundColor: lighten(theme.palette.primary.light, 0.9)}}>
    <Collapse in={configPanelOpen}>
    <Stack sx={{borderBottomWidth: '5px', borderBottomStyle: 'solid', borderBottomColor: theme.palette.primary.main}}>
        <Typography sx={{fontWeight:'bold', color: theme.palette.primary.main, padding: '8px'}}>List Parameters</Typography>
        <List
        type='View'
        view={{item_template: ''}}
        list={Globals.listOfAllViews}
        items={viewData}
        setLoginState={setLoginState}
        />
        <List
        type='List'
        view={{item_template: ''}}
        list={Globals.listOfAllLists}
        items={listData}
        setLoginState={setLoginState}
        />
    </Stack>
    </Collapse>
    </Stack>
  )
}

export default ConfigPanel;
