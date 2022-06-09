import React from "react";
import { createRoot } from "react-dom/client";

// import "./index.css";
import App from "./App";

// Find all widget divs
const widgetDivs = document.querySelectorAll(".opentable");

let appid = 0;

// Inject our React App into each class
widgetDivs.forEach((div) => {
  createRoot(div).render(
    /* <React.StrictMode> */
    <App initialViewid={div.dataset.viewid} appid={appid} />
    /* </React.StrictMode> */
  );
  appid += 1;
});
