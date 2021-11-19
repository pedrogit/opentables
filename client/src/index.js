import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// Find all widget divs
const widgetDivs = document.querySelectorAll('.opentable');

// Inject our React App into each class
widgetDivs.forEach(div => {
    ReactDOM.render(
      /*<React.StrictMode>*/
        <App viewid={div.dataset.viewid}/>
      /*</React.StrictMode>*/,
        div
    );
});
