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
    (editedView) => {
      var child = {...view[Globals.childlistFieldName]};
      setViewData({
        ...editedView[Globals.childlistFieldName][Globals.itemsFieldName][0],
        [Globals.childlistFieldName]: child
      });
    }, [view, setViewData]
  );

  const handleEditList = React.useCallback(
    (editedList) => {
      var items = [...view[Globals.childlistFieldName][Globals.itemsFieldName]];
      setViewData({
        ...view,
        [Globals.childlistFieldName]: {
          ...editedList[Globals.childlistFieldName][Globals.itemsFieldName][0],
          [Globals.itemsFieldName]: items
        }
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
              [Globals.childlistFieldName]: {
                ...Globals.listOfAllViews,
                [Globals.itemsFieldName]: view ? [view] : []
              }
            }}
            listSchemaStr={view[Globals.childlistFieldName][Globals.listSchemaFieldName]}
            setLoginState={setLoginState}
            setViewData={handleEditView}
            setErrorMsg={setErrorMsg}
            enableDeleteButton={false}
          />
          <List
            listType='List'
            view={{
              [Globals.childlistFieldName]: {
                ...Globals.listOfAllLists,
                [Globals.itemsFieldName]: view[Globals.childlistFieldName] ? [view[Globals.childlistFieldName]] : []
              }
            }}
            setLoginState={setLoginState}
            setViewData={handleEditList}
            setErrorMsg={setErrorMsg}
            enableDeleteButton={false}
          />
        </Stack>
      </Collapse>
    </Stack>
  )
}

export default ConfigPanel;
