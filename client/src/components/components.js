import React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Typography from "@mui/material/Typography";
import MUILink from "@mui/material/Link";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import MUISelect from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { useTheme } from "@mui/material/styles";
import ReCAPTCHA from "react-google-recaptcha";

import VisibilityPasswordTextField from "./VisibilityPasswordTextField";

const Globals = require("../../../common/globals");
const Errors = require("../../../common/errors");

const extractNameAndVal = (val) => {
  if (val) {
    return {
      propName: val.prop === undefined ? "Missing property name" : val.prop,
      propVal: val.val === undefined ? "Missing property value" : val.val,
    };
  }
  return {
    propName: "",
    propVal: "",
  };
};

/* *******************
 *  Label component
 ******************* */
function Label({
  val, // label text
  vertical = false, // label is over the component (vertical=true), or  on the left size of it (vertical=false)
  nolabel = false, // do not dispay the label
  sx, // label sx
}) {
  const theme = useTheme();
  const fontSize = vertical ? theme.typography.caption : theme.typography.body1;

  const defaultSx = {
    fontSize,
    color: theme.palette.primary.main,
    fontWeight: "bold",
    marginRight: 1,
  };

  if (!nolabel) {
    const separator = vertical ? null : <>&nbsp;:</>;
    return (
      <Typography sx={{ ...defaultSx, ...sx }}>
        {val}
        {separator}
      </Typography>
    );
  }

  return null;
}

/** ******************
 *  Text component
 ******************* */
function Text({
  val,
  inline = false, // edit mode is inline
  wrappedInform = false, // component is part of a form
  pretty = false, // make inline inputs pretty
  editmode = false, // switch between read and edit mode
  vertical = false, // vertical lavels (horizontal otherwise)
  label, // label
  nolabel = false, // do not display label
  labelSx = {}, // label sx
  sx, // component sx
}) {
  const { propName, propVal } = extractNameAndVal(val);

  const valueRef = React.useRef();
  const theme = useTheme();

  const [editVal, setEditVal] = React.useState(propVal);
  const [isEditing, setIsEditing] = React.useState(editmode);

  // reset the editValue when the component is updated with a new val
  React.useEffect(() => {
    if (wrappedInform && val && val.val !== undefined) {
      setEditVal(val.val);
    }
  }, [val, wrappedInform]);

  if (val && (propName || editVal)) {
    const defaultSx = {
      marginTop:
        inline && pretty && (editmode || isEditing) ? "8px" : "inherit",
      marginBottom:
        inline && pretty && (editmode || isEditing) ? "8px" : "inherit",
    };

    const setIsEditingOff = () => {
      if (!wrappedInform) {
        setIsEditing(false);
        if (!editVal) {
          setEditVal(propVal);
        }
      }
    };

    const handleEdit = () => {
      if (!wrappedInform && val.checkItemEditPerm(propName)) {
        if (!editVal) {
          setEditVal(propVal);
        }
        setIsEditing(true);
      }
    };

    const handleChange = (newVal) => {
      if (wrappedInform) {
        // change the List editingItem
        val.handleSaveProperty({ [propName]: newVal });
      } else {
        setEditVal(newVal);
      }
    };

    const handleSave = () => {
      if (!wrappedInform) {
        if (editVal !== propVal) {
          val.handleSaveProperty({ [propName]: editVal }, (success, value) => {
            if (success) {
              setIsEditingOff();
              setEditVal(value[propName]);
            }
          });
        } else {
          setIsEditingOff();
        }
      }
    };

    const keyPressed = (e) => {
      if (!wrappedInform) {
        if (e.keyCode === 13) {
          // enter
          handleSave();
        }
      }
      if (e.keyCode === 27) {
        // escape
        setEditVal(propVal);
        setIsEditingOff();
      }
    };

    const inputLabel = `Edit "${propName}"...`;
    const getWidth = () => {
      const labelFontWidth = 0.75 * theme.typography.fontSize * 0.4;
      const labelW = labelFontWidth * inputLabel.length;
      const inputPadding = 28;
      const popoverPadding = 16;
      return Math.max(
        (valueRef && valueRef.current && valueRef.current.offsetWidth
          ? valueRef.current.offsetWidth
          : 0) +
          inputPadding +
          popoverPadding,
        labelW + 2 * labelFontWidth + inputPadding + popoverPadding
      );
    };

    return (
      <>
        <Stack direction={vertical ? "column" : "row"}>
          {(!(inline && pretty) || !(editmode || isEditing)) && (
            <Label
              vertical={vertical}
              val={
                label || propName.charAt(0).toUpperCase() + propName.slice(1)
              }
              nolabel={nolabel}
              sx={{ ...defaultSx, ...sx, ...labelSx }}
            />
          )}
          {(editmode || isEditing) && inline ? (
            <ClickAwayListener onClickAway={setIsEditingOff}>
              <TextField
                name={propName}
                variant={pretty ? "outlined" : "filled"}
                sx={{
                  ...defaultSx,
                  ...sx,
                  backgroundColor: theme.palette.primary.palebg,
                }}
                inputProps={
                  pretty
                    ? {}
                    : {
                        style: { padding: "0px" },
                      }
                }
                size="small"
                label={
                  pretty
                    ? label ||
                      propName.charAt(0).toUpperCase() + propName.slice(1)
                    : null
                }
                fullWidth
                value={editVal}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={(e) => keyPressed(e)}
                InputLabelProps={{ shrink: true }}
                autoFocus={!wrappedInform}
              />
            </ClickAwayListener>
          ) : (
            <Typography
              id={propName}
              sx={{ ...defaultSx, ...sx }}
              onDoubleClick={handleEdit}
              ref={valueRef}
            >
              {propVal}
            </Typography>
          )}
        </Stack>
        <Popover
          open={(editmode || isEditing) && !inline}
          anchorEl={valueRef.current}
          onClose={setIsEditingOff}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Box sx={{ p: 1, width: getWidth() }}>
            <TextField
              sx={{ backgroundColor: theme.palette.primary.palebg }}
              fullWidth
              id="outlined-basic"
              variant="outlined"
              size="small"
              label={inputLabel}
              value={editVal}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={(e) => keyPressed(e)}
              autoFocus
            />
          </Box>
        </Popover>
      </>
    );
  }
  return null;
}

/** ******************
 *  Select component
 ******************* */
function Select({
  val,
  options,
  wrappedInform = false, // component is surrounded with a ItemWrapperForm form
  pretty = false, // make inline inputs pretty
  editmode = false, // init in edit mode
  vertical = false, // vertical lavels (horizontal otherwise)
  label, // label
  nolabel = false, // do not display label
  labelSx = {}, // label sx
  sx, // component sx
}) {
  const { propName, propVal } = extractNameAndVal(val);

  const [editVal, setEditVal] = React.useState(propVal);
  const [isEditing, setIsEditing] = React.useState(editmode);

  if (val && (propName || editVal)) {
    const defaultSx = {
      marginTop:
        wrappedInform && pretty && (editmode || isEditing) ? "8px" : "inherit",
      marginBottom:
        wrappedInform && pretty && (editmode || isEditing) ? "8px" : "inherit",
    };

    const setIsEditingOff = () => {
      if (!wrappedInform) {
        setIsEditing(false);
        if (!editVal) {
          setEditVal(propVal);
        }
      }
    };

    const handleEdit = () => {
      if (!wrappedInform && val.checkItemEditPerm(propName)) {
        if (!editVal) {
          setEditVal(propVal);
        }
        setIsEditing(true);
      }
    };

    const handleChange = (newVal) => {
      if (!wrappedInform && newVal !== propVal) {
        val.handleSaveProperty({ [propName]: newVal }, (success, data) => {
          if (success) {
            setIsEditingOff();
            setEditVal(data[propName]);
          }
        });
      }
    };

    const keyPressed = (e) => {
      if (e.keyCode === 27) {
        // escape
        setEditVal(propVal);
        setIsEditingOff();
      }
    };

    return (
      <Stack direction={vertical ? "column" : "row"}>
        {(!(wrappedInform && pretty) || !(editmode || isEditing)) && (
          <Label
            vertical={vertical}
            val={label || propName.charAt(0).toUpperCase() + propName.slice(1)}
            nolabel={nolabel}
            sx={{ ...defaultSx, ...sx, ...labelSx }}
          />
        )}
        {editmode || isEditing ? (
          <MUISelect
            name={propName}
            open={editmode || isEditing}
            variant="standard"
            sx={{ ...defaultSx, ...sx }}
            MenuProps={{
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "left",
              },
              getContentAnchorEl: null,
            }}
            SelectDisplayProps={{ style: { padding: "0px 20px 0px 0px " } }}
            size="small"
            autoWidth
            value={editVal}
            onChange={(e) => {
              handleChange(e.target.value);
            }}
            onKeyDown={(e) => keyPressed(e)}
            onClose={setIsEditingOff}
          >
            <MenuItem value="" dense>
              <em>unset</em>
            </MenuItem>
            {options &&
              options.map((opt) => (
                <MenuItem value={opt} dense>
                  {opt}
                </MenuItem>
              ))}
          </MUISelect>
        ) : (
          <Typography
            id={propName}
            sx={{ ...defaultSx, ...sx }}
            onDoubleClick={handleEdit}
          >
            {propVal}
          </Typography>
        )}
      </Stack>
    );
  }
  return null;
}

/** ***********************
 *  Viewlink component
 ************************ */
function Viewlink({
  text, // text to display under the link
  viewid, // viewid of the view to display
}) {
  return (
    <Typography>
      {
        // eslint-disable-next-line prettier/prettier, jsx-a11y/anchor-is-valid
      }<MUILink
        onClick={
          viewid && viewid.setViewId ? () => viewid.setViewId(viewid.val) : null
        }
      >
        {text && text.val ? text.val : "Text property missing..."}
      </MUILink>
    </Typography>
  );
}

/** ***********************
 *  Link component
 ************************ */
function Link({
  text, // text to display under the link
  href,
  newtab = true,
  wrappedInform = false, // component is part of a form
  pretty = false, // make inline inputs pretty
  editmode = false, // switch between read and edit mode
  vertical = false, // vertical lavels (horizontal otherwise)
  label, // label,
  nolabel = false, // do not display label
  labelSx = {}, // label sx
  sx, // component sx
}) {
  const [isEditing, setIsEditing] = React.useState(editmode);
  const [alreadyClicked, setAlreadyClicked] = React.useState(false);
  const alreadyClickedTimeout = React.useRef(null);

  const valueRef = React.useRef();

  const tempText = extractNameAndVal(text);
  const { propName } = tempText;
  let { propVal } = tempText;
  const textPropName = propName;
  const textPropVal = propVal;

  ({ propVal } = extractNameAndVal(href));
  const hrefPropVal = propVal;

  if (text && textPropName) {
    const defaultSx = {
      marginTop:
        wrappedInform && pretty && (editmode || isEditing) ? "8px" : "inherit",
      marginBottom:
        wrappedInform && pretty && (editmode || isEditing) ? "8px" : "inherit",
    };

    const setIsEditingOff = () => {
      if (!wrappedInform) {
        setIsEditing(false);
      }
    };

    const handleEdit = (e) => {
      e.preventDefault();
      if (alreadyClicked) {
        // second click
        setAlreadyClicked(false);
        clearTimeout(alreadyClickedTimeout.current);
        if (!wrappedInform && text.checkItemEditPerm(textPropName)) {
          setIsEditing(true);
        }
      } else {
        // first click
        setAlreadyClicked(true);
        alreadyClickedTimeout.current = setTimeout(() => {
          // no double click
          setAlreadyClicked(false);
          if (newtab) {
            window.open(hrefPropVal, "_blank");
          } else {
            window.location = hrefPropVal;
          }
        }, 300);
      }
    };

    return (
      <>
        <Stack direction={vertical ? "column" : "row"}>
          {(!(wrappedInform && pretty) || !(editmode || isEditing)) && (
            <Label
              vertical={vertical}
              val={
                label ||
                textPropName.charAt(0).toUpperCase() + textPropName.slice(1)
              }
              nolabel={nolabel}
              sx={{ ...defaultSx, ...sx, ...labelSx }}
            />
          )}
          <Typography id={propName} sx={{ ...defaultSx, ...sx }} ref={valueRef}>
            {hrefPropVal ? (
              <MUILink onClick={handleEdit} href={hrefPropVal}>
                {textPropVal}
              </MUILink>
            ) : (
              textPropVal
            )}
          </Typography>
        </Stack>
        <Popover
          open={editmode || isEditing}
          anchorEl={valueRef.current}
          onClose={setIsEditingOff}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Box sx={{ p: 1 }}>
            <Text val={text} inline label="Text" />
            <Text val={href} inline label="URL" />
          </Box>
        </Popover>
      </>
    );
  }
  return null;
}

/** ***********************
 *  Password component
 *
 *  Always in edit mode
 ************************ */
function Password({
  val,
  inline = true, // inline or popop (for now always inline)
  pretty = false, // make inline inputs pretty
  vertical = false, // label placement
  label, // label to display
  nolabel = false, // do not display any label
  labelSx = {}, // label sx
  sx, // input sx
}) {
  const { propName, propVal } = extractNameAndVal(val);

  const [editVal, setEditVal] = React.useState(propVal);
  const theme = useTheme();

  if (val && (propName || editVal)) {
    const defaultSx = {
      marginTop: inline && pretty ? "8px" : "inherit",
      marginBottom: inline && pretty ? "8px" : "inherit",
    };

    const handleChange = (newVal) => {
      setEditVal(newVal);
    };

    return (
      <Stack direction={vertical ? "column" : "row"}>
        {!pretty && (
          <Label
            vertical={vertical}
            val={label || propName.charAt(0).toUpperCase() + propName.slice(1)}
            nolabel={nolabel}
            sx={{ ...defaultSx, ...sx, ...labelSx }}
          />
        )}

        <VisibilityPasswordTextField
          name={propName}
          value={editVal}
          sx={{
            ...defaultSx,
            ...sx,
            backgroundColor: theme.palette.primary.palebg,
          }}
          inputProps={
            pretty
              ? {}
              : {
                  style: { padding: "0px" },
                }
          }
          variant={inline && !pretty ? "filled" : "outlined"}
          size="small"
          fullWidth
          label={
            inline && !pretty
              ? null
              : label || propName.charAt(0).toUpperCase() + propName.slice(1)
          }
          autoComplete="off"
          onChange={(e) => handleChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
    );
  }
  return null;
}

/** ***********************
 *  Add Item Wrapper Form
 *
 *  Add cancel (or add or reset) and Add (or Register) buttons
 *  around the item template and set the template component
 *  properties to necessary values (wrappedInform, inline, pretty)
 ************************ */
function ItemWrapperForm({ handlers, otherProps, children }) {
  const defChildProps = {
    wrappedInform: true,
    inline: true,
    pretty: true,
    editmode: true,
  };
  const [recaptchaResponse, setRecaptchaResponse] = React.useState("");
  const [submitButtonDisabled, setSubmitButtonDisabled] = React.useState(true);

  const recaptchaRef = React.useRef();

  const resetRecaptcha = () => {
    if (recaptchaRef && recaptchaRef.current) {
      setRecaptchaResponse("");
      recaptchaRef.current.reset();
    }
  };

  const resetForm = () => {
    resetRecaptcha();
    otherProps.resetEditingItem();
  };

  let options = {
    cancelLabel: "Cancel",
    cancelAction: () => {
      resetForm();
      otherProps.setAddItem(false);
    },
    addLabel: "Add",
    addAction: () => otherProps.setAddItem(false),
  };

  if (otherProps.addItemMode === Globals.addWithPersistentFormNoItems) {
    options = {
      ...options,
      cancelAction: () =>
        otherProps.backToMainView(Globals.viewOnAllViewViewId),
      addLabel: otherProps.addLabel ? otherProps.addLabel : "Save",
      addAction: () => otherProps.backToMainView(Globals.viewOnAllViewViewId),
      addMessage: {
        severity: "success",
        title: "Success!",
        text: "Your new item was added...",
      },
    };
    if (otherProps && otherProps.addMessageText) {
      options.addMessage.text = otherProps.addMessageText;
    }
    if (otherProps && otherProps.addMessageTitle) {
      options.addMessage.title = otherProps.addMessageTitle;
    }
  }

  if (otherProps.addItemMode === Globals.addWithPersistentFormAndItems) {
    options = {
      cancelLabel: "Reset",
      cancelAction: () => resetForm(),
      addLabel: "Add",
      addAction: () => resetForm(),
    };
  }

  const extractValues = (target) => {
    const item = {};
    for (let i = 0; i < target.length - 1; i += 1) {
      if (
        target[i].type !== "button" &&
        target[i].type !== "fieldset" &&
        target[i].name !== undefined &&
        target[i].defaultValue !== undefined &&
        target[i].defaultValue !== null &&
        target[i].defaultValue !== ""
      ) {
        item[target[i].name] = target[i].defaultValue;
      }
      if (target[i].name === Globals.gRecaptchaResponse && recaptchaResponse) {
        item[Globals.gRecaptchaResponse] = recaptchaResponse;
      }
    }
    return item;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otherProps.recaptcha || (otherProps.recaptcha && recaptchaResponse)) {
      const newItem = extractValues(e.target);
      handlers.handleAddItem({
        item: newItem,
        addToLocalList:
          otherProps.addItemMode !== Globals.addWithPersistentFormNoItems,
        callback: (success) => {
          if (success) {
            setSubmitButtonDisabled(true);
            options.addAction();
            if (options.addMessage) {
              handlers.setErrorMsg(options.addMessage);
            }
          }
        },
      });
    } else {
      handlers.setErrorMsg({ text: Errors.ErrMsg.Recaptcha_Failed });
    }
  };

  const childrenWithProp = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, defChildProps);
    }
    return child;
  });

  const keyPressed = (e) => {
    if (e.keyCode === 27) {
      options.cancelAction();
    }
    if (e.keyCode !== 13 && e.keyCode !== 8 && e.keyCode !== 46) {
      setSubmitButtonDisabled(false);
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <form onSubmit={handleSubmit} onKeyDown={keyPressed}>
      {childrenWithProp}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent={otherProps.recaptcha ? "space-between" : "flex-end"}
      >
        {otherProps.recaptcha && (
          <ReCAPTCHA
            id="g-recaptcha"
            ref={recaptchaRef}
            sitekey={
              window.Cypress
                ? "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // always positive key
                : "6LcH-QkfAAAAAEKeUGIPbeY1OUlN4aQRkMyRoY_V"
            }
            onChange={(value) => setRecaptchaResponse(value)}
            onExpired={() => setRecaptchaResponse("")}
          />
        )}
        <Stack direction="row" justifyContent="flex-end" alignItems="flex-end">
          <ButtonGroup variant="contained" size="small">
            <Button
              id="addCancelItemFormButton"
              onClick={() => options.cancelAction()}
            >
              {options.cancelLabel}
            </Button>
            <Button
              id="addItemFormButton"
              type="submit"
              disabled={submitButtonDisabled}
            >
              {options.addLabel}
            </Button>
          </ButtonGroup>
        </Stack>
      </Stack>
    </form>
  );
}

function allComponentsAsJson() {
  return { Text, Select, Label, Viewlink, Link, Password, ItemWrapperForm };
}

export { allComponentsAsJson, Text };
