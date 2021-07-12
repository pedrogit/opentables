const express = require('express');
const listRouter = express.Router();

listRouter.get('/:listid/', (req, res) => {
    console.log('get');
    res.send('get');
});

listRouter.post('/list', (req, res) => {
    console.log('post');
    res.send('post');
});

module.exports = listRouter;
