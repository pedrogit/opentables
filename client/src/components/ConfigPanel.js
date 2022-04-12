import React from "react";
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from "@mui/material/Stack";
import Collapse from "@mui/material/Collapse";
import { useTheme } from "@mui/material/styles";
import IconButton from '@mui/material/IconButton';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PropTypes from 'prop-types';

// local imports
import List from "./List";
const Globals = require("../common/globals");

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <>
          {children}
        </>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function ConfigPanel({
  configPanelOpen,
  toggleConfigPanel,
  view,
  setViewData,
  setLoginState,
  setErrorMsg,
  handleReload
}) {
  const [value, setValue] = React.useState(0);
  const theme = useTheme();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

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
      var newViewData = {
        ...view,
        [Globals.childlistFieldName]: {
          ...editedList[Globals.childlistFieldName][Globals.itemsFieldName][0],
        }
      }
      if (view[Globals.childlistFieldName][Globals.itemsFieldName]) {
        newViewData[Globals.childlistFieldName][Globals.itemsFieldName] = [...view[Globals.childlistFieldName][Globals.itemsFieldName]];
      }
      setViewData(newViewData);
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
              p: theme.openTable.buttonPadding,
              zIndex: '100'
            }}
            id="closeErrorMsgButton"
            aria-label="close error panel" 
            color="inherit"
            onClick={() => toggleConfigPanel(false)}
          >
            <HighlightOffIcon />
          </IconButton>

          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                <Tab label={Globals.viewProperties}/>
                <Tab label={Globals.listProperties} />
              </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
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
                handleReload={handleReload}
              />
            </TabPanel>
            <TabPanel value={value} index={1}>
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
                handleReload={handleReload}
              />
            </TabPanel>
          </Box>
        </Stack>
      </Collapse>
    </Stack>
  )
}

export default ConfigPanel;
