var server = require('./libtwo/server')

var app = {}

// defining the init function of the app
app.init = function (){
//executing the server
  server.init()
}
//executing the app
app.init();

module.exports = app;
