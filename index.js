const express = require('express');
const path = require('path');

const app = express();

// make the server able to server filesystem files from the public folder
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use('/api/list', require('./listrouter'));

app.listen(3000, () => {
    console.log('App started on port 3000');
});