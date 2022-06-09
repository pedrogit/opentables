import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Tooltip from "@mui/material/Tooltip";

function VisibilityPasswordTextField({ ...rest }) {
  const [isVisible, toggleVisible] = React.useState(false);

  const defaultSx = { backgroundColor: "white", paddingRight: "0px" };

  const {
    name,
    value,
    label,
    required,
    sx,
    inputProps,
    variant,
    size,
    fullWidth,
    autoComplete,
    inputRef,
    onChange,
    onKeyDown,
    error,
    InputLabelProps,
  } = rest;
  return (
    <TextField
      name={name}
      value={value}
      label={label}
      required={required}
      sx={sx}
      inputProps={inputProps}
      variant={variant}
      size={size}
      type={isVisible ? "text" : "password"}
      fullWidth={fullWidth}
      autoComplete={autoComplete}
      onChange={onChange}
      onKeyDown={onKeyDown}
      error={error}
      inputRef={inputRef}
      InputLabelProps={InputLabelProps}
      // eslint-disable-next-line react/jsx-no-duplicate-props
      InputProps={{
        id: "passwordInput",
        sx: { ...defaultSx, ...rest.sx, marginTop: "0px", marginBottom: "0px" },
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
    />
  );
}

export default VisibilityPasswordTextField;
