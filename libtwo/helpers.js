
var https = require('https')
var http= require ('http')
var queryString = require ('querystring')
var _data = require('./data')
var config = require ('../config');
// initiate the helper function

var helpers ={}
helpers.parseJsonToObject = (str)=>{

try {
var obj = JSON.parse(str)
return obj;

}
catch (e){
  console.log(e);
  return {}
}
}

helpers.createTokenId =  (strlength) => {
// get the string letters pool
var strpool = 'abcdefghijklmnopqrstuvwxyz0123456789'
var token = '';
// loop according to the strpool lenght to create a token for the username
for (var i = 1 ; i < strlength ; i++) {
var randomchar= strpool.charAt(Math.floor(Math.random ()*strpool.length))
token += randomchar

}
return (token)
}

helpers.calcordertotal = (data,cb) => {
  data = helpers.parseJsonToObject (data)
  var total =0;
  for (var i = 0 ; i< data.item.length ; i ++) {
   total += data.qty[i]*data.price[i]
}
return (total);
}

// getting the visa details and create a new token for it for the customer to pay the order



helpers.createCharge = (orderdetails, cb) => {

              // create the payload that will be sent to stripe to create charges
               var payload = {
               'amount':orderdetails.amount*100,
               'currency' : 'usd',
               'description': orderdetails.description,
               'source':'tok_amex'
               }
               // we are stringifying the string as query string to be sent to the stripe server
               var stringPayload = queryString.stringify(payload)
               console.log ('the string payload '+ stringPayload)
               // create the order for the customer
               var requestDetails = {
               'hostname': 'api.stripe.com',
               'path':'/v1/charges',
               'method': 'POST',
               'auth': config.auth,
               'headers': {
                'Content-Type': 'application/x-www-form-urlencoded ',
                'Content-Length': Buffer.byteLength(stringPayload)
               }
             };

               //instinatie the requestDetails

              var req = https.request(requestDetails , (res)=> {
                   var status = res.statusCode
                   var chargeID = res.id;
                      if (status ==200  || status == 201) {
                             console.log ('sucessfully paid')
                             // return back false without error and the charge id
                              cb (false)
                              }
                      else {
                             console.log('failed payment ' + status)
                              cb ( true)
                               }

                         })

// bind to the error request so it doesn't get thrown
              req.on ('error' , (e)=> {

                cb (e)
              })

// add the payload
              req.write (stringPayload);

//end the request
              req.end ();
  }



helpers.createOrderNumber = ()=> {

  var strpool = 'abcdefghijklmnopqrstuvwxyz0123456789'
  var ordernumber = '';
  // loop according to the strpool lenght to create a token for the username
  for (var i = 1 ; i < 5 ; i++) {
  var randomchar= strpool.charAt(Math.floor(Math.random ()*strpool.length))
  ordernumber += randomchar

  }
  return (ordernumber)
  }



helpers.sendPaymentConfirmation = (data)=> {
  var payload = {
  'from':'Mailgun Sandbox <postmaster@sandbox354fbf44bbd74b7db7ea6a84f5bbebdf.mailgun.org>',
  'to':'andbox354fbf44bbd74b7db7ea6a84f5bbebdf.mailgun.org',
  'to' : data.email,
  'subject': 'new order ' + data.on,
  'text':'total amount has been paid for the order ' + data.amount
  }
  // we are stringifying the string as query string to be sent to the stripe server
  var stringPayload = queryString.stringify(payload)
  console.log ('the string payload '+ stringPayload)
  // create the order for the customer


  var requestDetails = {
  'hostname': 'api.mailgun.net',
  'path':'/v3/sandbox354fbf44bbd74b7db7ea6a84f5bbebdf.mailgun.org/message',
  'method': 'POST',
  'auth': config.mailgunauth,
  'headers': {
   'Content-Type': 'application/x-www-form-urlencoded ',
   'Content-Length': Buffer.byteLength(stringPayload)
  }
};

  var req = https.request(requestDetails , (res)=> {
    var status = res.statusCode
       if (status ==200  || status == 201) {
              console.log ('email sent successfully')


              // return back false without error and the charge id

               }
       else {
              console.log('email failed ' + status)

                }

          })
// bind to the error request so it doesn't get thrown
req.on ('error' , (e)=> {

 cb (e)
})
// add the payload
req.write (stringPayload);

//end the request
req.end ();



}

module.exports = helpers
