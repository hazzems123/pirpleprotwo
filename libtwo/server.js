//hi hazzem
// require the http module
var http = require ('http');
var https = require('https');
var config = require ('../config');
var url = require ('url');
var StringDecoder = require('string_decoder').StringDecoder;
var handlers = require('./handlers')
var helpers = require ('./helpers')
var fs = require ('fs')
var path = require ('path')

// initiating the server object that will contain the all the server utilities

var server = {}
//creating a new http server
server.httpServer = http.createServer((req,res) => {
server.unifiedServer (req,res)
});

var httpsServerOptions = {
  'key': fs.readFileSync(path.resolve('./https/key.pem')),
  'cert': fs.readFileSync(path.resolve('./https/cert.pem'))
};
// creating a new httpsserver
server.httpsServer = https.createServer (httpsServerOptions,(req,res)=> {
  server.unifiedServer (req,res)
})
// the server init function

server.init = () =>{
  server.httpServer.listen (config.httpPort, () =>{
  console.log('the http server is running on port ' + config.httpPort )})



  server.httpsServer.listen (config.httpsPort, ()=> {
    console.log ('the  https server is running on port ' + config.httpsPort)
  })
}
// server liastening in a new port


// functions that execute when we receive a request to structure the data

server.unifiedServer = (req,res) => {

// parse the url
parsedUrl = url.parse(req.url, true)
// get the path
path = parsedUrl.pathname;
trimmedPath = path.replace(/^\/+|\/+$/g,'')

//get the query object
var queryStringObject = parsedUrl.query

// get the http method
var method = req.method.toLowerCase();
// get the headers
var headers = req.headers;
// decode and save the data payload
var decoder = new StringDecoder('utf-8');
var buffer = '';

  req.on('data', (data)=> {
  buffer += decoder.write(data);
  });

  req.on('end',() =>{
      buffer += decoder.end();



// Structure the data to be sent to the choosenhandler
var data = {
'trimmedPath':trimmedPath,
'queryStringObject':queryStringObject,
'headers':headers,
'payload':helpers.parseJsonToObject(buffer)
}

// check the path for the matching handler
var chosenhandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notfound


// route the request to the choosenhandler
chosenhandler (data, (statuscode,payload)=> {
  // use the status code that was returned from the handler callback otherwise use default 200
  statuscode = typeof(statuscode) =='number' ? statuscode :200;
  payload = typeof(payload) =='object' ? payload :{};
  // convert the payload into stringify
  payloadString = JSON.stringify (payload);
  // set the header response in the browser
  res.setHeader ('Content-Type','application/json');
  //the replying status code
  res.writeHead (statuscode);
 // reply with the payload string which has been set
  res.end(payloadString);
})
})
}

server.router = {
  'newuser' : handlers.newuser,
  'login' : handlers.login,
  'user': handlers.user,
  'cart':handlers.cart,
  'order':handlers.order,
  'logout':handlers.logout
}

module.exports= server;
