const express = require('express');
const api = express();
api.use(express.static(__dirname + '/public'));
api.listen(3000, ()=> {
    console.log('Server up and running, game on!')
});