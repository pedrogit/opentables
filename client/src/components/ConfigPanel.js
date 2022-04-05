import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import { useTheme } from "@mui/material/styles";
import IconButton from '@mui/material/IconButton';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

// local imports
import List from "./List";
const Globals = require("../common/globals");

function ConfigPanel({
  configPanelOpen,
  toggleConfigPanel,
  view,
  setViewData,
  setLoginState,
  setErrorMsg
}) {
  const theme = useTheme();

  const handleEditView = React.useCallback(
    (editedView, callback) => {
      var child = {...view[Globals.childlistFieldName]};
      setViewData({
        ...editedView[Globals.childlistFieldName][Globals.itemsFieldName][0],
        [Globals.childlistFieldName]: child
      });
    }, [view, setViewData]
  );

  return (
    <Stack sx={{backgroundColor: theme.palette.primary.palebg}}>
      <Collapse in={configPanelOpen}>
        <Stack sx={{
          position: 'relative', 
          borderBottomWidth: '5px', 
          borderBottomStyle: 'solid', 
          borderBottomColor: theme.palette.primary.main
        }}>
          <IconButton
            sx = {{
              position: 'absolute', 
              top: '1px', 
              right: '1px',
              p: theme.openTable.buttonPadding
            }}
            id="closeErrorMsgButton"
            aria-label="close error panel" 
            color="inherit"
            onClick={() => toggleConfigPanel(false)}
          >
            <HighlightOffIcon />
          </IconButton>
          <Typography sx={{fontWeight:'bold', color: theme.palette.primary.main, padding: '8px'}}>{Globals.listProperties}</Typography>
          <List
            listType='View'
            view={{
              [Globals.itemTemplateFieldName]: '',
              [Globals.childlistFieldName]: {
                ...Globals.listOfAllViews,
                [Globals.itemsFieldName]: view ? [view] : []
              }
            }}
            setLoginState={setLoginState}
            setViewData={handleEditView}
            setErrorMsg={setErrorMsg}
            enableDeleteButton={false}
          />
          <List
            listType='List'
            view={{
              [Globals.itemTemplateFieldName]: '',
              [Globals.childlistFieldName]: {
                ...Globals.listOfAllLists,
                [Globals.itemsFieldName]: view[Globals.childlistFieldName] ? [view[Globals.childlistFieldName]] : []
              }
            }}
            setLoginState={setLoginState}
            setErrorMsg={setErrorMsg}
            enableDeleteButton={false}
          />
        </Stack>
      </Collapse>
    </Stack>
  )
}

export default ConfigPanel;
