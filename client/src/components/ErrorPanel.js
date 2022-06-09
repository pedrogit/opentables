import React from "react";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { useTheme } from "@mui/material/styles";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

function ErrorPanel({
  errorMsg,
  setErrorMsg,
  autoClose,
  closeButton,
  panelId = "errorPanel",
}) {
  const theme = useTheme();
  const closeTimeOutRef = React.useRef(null);
  const openTimeOutRef = React.useRef(null);

  React.useEffect(() => {
    if (
      errorMsg !== null &&
      errorMsg.text &&
      (!errorMsg.open || errorMsg.open === false)
    ) {
      clearTimeout(openTimeOutRef.current);
      openTimeOutRef.current = setTimeout(() => {
        setErrorMsg({ ...errorMsg, open: true });
        if (autoClose) {
          clearTimeout(closeTimeOutRef.current);
          closeTimeOutRef.current = setTimeout(
            () => setErrorMsg({ open: false }),
            4000
          );
        }
      }, 300);
    }
  }, [errorMsg, autoClose, setErrorMsg]);

  let finalTitle = "Error";

  if (errorMsg && errorMsg.title) {
    if (typeof errorMsg.title === "function") {
      finalTitle = errorMsg.title();
    } else {
      finalTitle = errorMsg.title;
    }
  }

  return (
    <Stack sx={{ position: "relative" }} id={panelId}>
      <Collapse in={errorMsg && errorMsg.open && errorMsg.open === true}>
        <Stack
          sx={{
            position: "relative",
            borderBottomWidth: "5px",
            borderBottomStyle: "solid",
            borderBottomColor: theme.palette.primary.main,
          }}
        >
          {closeButton && (
            <IconButton
              sx={{
                position: "absolute",
                top: "1px",
                right: "1px",
                p: theme.openTable.buttonPadding,
              }}
              id="closeErrorMsgButton"
              aria-label="close error panel"
              color="inherit"
              onClick={() => setErrorMsg({ open: false })}
            >
              <HighlightOffIcon />
            </IconButton>
          )}
          <Alert
            severity={
              errorMsg && errorMsg.severity ? errorMsg.severity : "error"
            }
            color="primary"
            sx={{ padding: "5px" }}
            onClick={() => closeButton && clearTimeout(closeTimeOutRef.current)}
          >
            <AlertTitle>{finalTitle}</AlertTitle>
            {errorMsg &&
            errorMsg.text &&
            errorMsg.open &&
            errorMsg.open === true ? (
              errorMsg.text
            ) : (
              <span> </span>
            )}
          </Alert>
        </Stack>
      </Collapse>
    </Stack>
  );
}

ErrorPanel.defaultProps = {
  autoClose: true,
  closeButton: true,
};

function UncontrolledErrorPanel({ errorMsg, autoClose, closeButton }) {
  const [unControlledErrorMsg, setErrorMsg] = React.useState(errorMsg);
  return (
    <ErrorPanel
      panelId="uncontrolledErrorPanel"
      errorMsg={unControlledErrorMsg}
      setErrorMsg={setErrorMsg}
      autoClose={autoClose}
      closeButton={closeButton}
    />
  );
}

export { ErrorPanel, UncontrolledErrorPanel };
