'use strict';
let express = require('express');
let path = require('path');
var hbs = require('express-hbs');
let routes = require('./routes/routes');

let app = express();
app.use(routes);
app.use(express.static(__dirname + '/api/public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);


let port = process.env.PORT || 3003;

app.listen(port, function() {
  console.log(`server started at port ${port}`);
});
