import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

function VisibilityPasswordTextField({ ...rest }) {
  //const { isVisible, onVisibilityChange,  = props;
  const [isVisible, toggleVisible] = React.useState(false);

  return (
    <TextField
      {...rest}
      type={isVisible ? "text" : "password"}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
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
          </InputAdornment>
        ),
      }}
    ></TextField>
  );
}

export default VisibilityPasswordTextField;
