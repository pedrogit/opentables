import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Tooltip from '@mui/material/Tooltip';

function VisibilityPasswordTextField({ ...rest }) {
  const [isVisible, toggleVisible] = React.useState(false);

  var defaultSx = {backgroundColor: 'white', paddingRight: "0px"};

  return (
    <TextField
      {...rest}
      type={isVisible ? "text" : "password"}
      InputProps={{
        id: "passwordInput",
        sx: {...defaultSx, ...rest.sx, marginTop: "0px", marginBottom: "0px"},
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip title="View Password">
              <IconButton
                aria-label="Toggle password visibility"
                onClick={() => {
                  toggleVisible(!isVisible);
                }}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
              >
                {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    ></TextField>
  );
}

export default VisibilityPasswordTextField;
