import React from "react";
import JsxParser from "react-jsx-parser";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import axios from "axios";

import * as Components from "./components";

// Define all components in the current scope
// so they can be used directly, without
// namespace (e.g. Components.Text), in the template
for (let name in Components) {
  global[name] = Components[name];
}

function Item({ template, item, rowNb, toggleLogin }) {
  const [newItem, setItem] = React.useState(item);

  const theme = useTheme();

  var defaultSx = { bgcolor: rowNb % 2 ? "#FFF" : "#EEE", padding: 1 };

  var patchHandler = function (val) {
    toggleLogin(false, {
      severity: "warning",
      title: "Permission denied",
      msg:
        'You do not have permissions to edit "' +
        Object.keys(val)[0] +
        '". Please login with valid credentials...',
      action: {
        method: "patch",
        url: "http://localhost:3001/api/opentables/" + newItem._id,
        //url: '/api/opentables/' + newItem._id,
        data: val,
        callback: (success, data) => {
          if (success) {
            setItem(data);
          }
        },
      },
    });
    return false;
  };

  var setBindings = function (item) {
    // add property name and rest handlers
    var result = {};
    for (var key in item) {
      if (item.hasOwnProperty(key)) {
        result[key] = {
          patchHandler: patchHandler,
          prop: key,
          val: item[key] ? item[key] : "",
        };
      }
    }
    return result;
  };

  return (
    <Box className="item" sx={defaultSx}>
      <JsxParser
        bindings={setBindings(newItem)}
        components={{ ...Components.allComponentsAsJson(), Box, Stack }}
        jsx={template}
        renderInWrapper={false}
        onError={() => {}}
        renderError={({ error }) => <span>{error}</span>}
        showWarnings={false}
        allowUnknownElements={false}
        renderUnrecognized={(tagName) => (
          <span style={{ color: theme.palette.primary.main }}>
            Error: unrecognized tag ({tagName})...
          </span>
        )}
      />
    </Box>
  );
}

export default Item;
