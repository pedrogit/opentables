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
const Globals = require("../../../common/globals");
const Schema = require("../../../common/schema");

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
  showConfigPanel,
  setShowConfigPanel,
  view,
  setViewData,
  setAuthAPIRequest,
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

  var parentViewView = {
    [Globals.childlistFieldName]: {
      ...Globals.listOfAllViews,
      [Globals.itemsFieldName]: view ? [view] : []
    }
  }

  var parentListView = {
    [Globals.childlistFieldName]: {
      ...Globals.listOfAllLists,
      [Globals.itemsFieldName]: view[Globals.childlistFieldName] ? [view[Globals.childlistFieldName]] : []
    }
  }

  var noListRPerm = parentListView[Globals.childlistFieldName][Globals.itemsFieldName][0] === Globals.permissionDeniedOnListOrItems;

  return (
    <Stack sx={{backgroundColor: theme.palette.primary.palebg}}>
      <Collapse in={showConfigPanel}>
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
            id="closeConfigPanelButton"
            aria-label="close error panel" 
            color="inherit"
            onClick={() => setShowConfigPanel(false)}
          >
            <HighlightOffIcon />
          </IconButton>

          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                <Tab id="viewProperties" label={Globals.viewProperties}/>
                <Tab 
                  id="listProperties"
                  disabled={noListRPerm}
                  label={Globals.listProperties + (noListRPerm ? " (" + Globals.permissionDenied + ")" : "")}
                />
              </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
              {showConfigPanel && <List
                listType={Globals.viewListType}
                view={parentViewView}
                parsedSchema={new Schema((Globals.listOfAllViews)[Globals.listSchemaFieldName])}
                listSchemaStr={view[Globals.childlistFieldName][Globals.listSchemaFieldName]}
                setAuthAPIRequest={setAuthAPIRequest}
                setViewData={handleEditView}
                setErrorMsg={setErrorMsg}
                showDeleteButton={false}
                handleReload={handleReload}
              />}
            </TabPanel>
            <TabPanel value={value} index={1}>
              {showConfigPanel && <List
                listType={Globals.listListType}
                view={parentListView}
                parsedSchema={new Schema((Globals.listOfAllLists)[Globals.listSchemaFieldName])}
                setAuthAPIRequest={setAuthAPIRequest}
                setViewData={handleEditList}
                setErrorMsg={setErrorMsg}
                showDeleteButton={false}
                handleReload={handleReload}
              />}
            </TabPanel>
          </Box>
        </Stack>
      </Collapse>
    </Stack>
  )
}

export default ConfigPanel;
