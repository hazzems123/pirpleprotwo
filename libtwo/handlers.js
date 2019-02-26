

var _data = require('./data')
var helpers = require('./helpers')
//inistintiate the handlers object
var handlers = {}

//

// handler when we create a new user
handlers.newuser = (data,cb)=> {
// extracting the data and making sure the user filled all the fields
  var username = data.payload.username
  var address = data.payload.address
  var email = data.payload.email
//read from the data logs and check if the user exiting
if (username && address && email) {
  _data.read('users',username, (err) =>{

//if their is an error reading the user then the user isn't existing
    if (err) {
      // creating new user object
      var userObject = {
     'username' : username,
     "address" : address,
     "email" : email,
     "orders":[]
      }
// create a new user and write the file by username
     _data.create('users',userObject.username,userObject,(err) =>{

       if (!err){
        cb(200,{User:'User Created Successfully'})
         }
         else {cb(404,{User:'Error creating a  new user'})}
          })
         }
    else {
      cb (500,{User:'User is already existing'})
    }
     })

}
else {cb(408,{data:"U didn't fill all the required data"})}
}

handlers.notfound = (data,cb )=> {
  cb (404 , {url:"This page isn't found"})
}

handlers.login = (data , cb)=> {
  var username = data.payload.username
// we make sure the user who logged in is existing before creating a new token
 _data.read ('users' , username, (err) => {

  if (!err) {
    // once user is existing we create a token id and write the data into folder
    console.log('we started creating the token')
       var tokenId = helpers.createTokenId(20)
    console.log('this is the token ' + tokenId)
       var tokendata = {
         user : data.payload.username,
         token : tokenId,
       }

             _data.create ('tokens',tokenId,tokendata ,(err,token)=>{
    // if no error creating the folder we return back the tokenID back to the customer
                if (!err) {
                   cb (200, {success : 'you are now logged in'})
                      }
    // else error creating the token
                else {502 , { error :' error writing the  token'}}
                             })
           }
    // if we couldn't create a new token
           else { cb (404 , {error :'user doesn\'t exist'})}

       })
  }


handlers.user = (data,cb) => {
// calling the relevant function from the handlers container
  handlers._user[data.payload.method](data,cb)

  }
// container for all the handler user functions
handlers._user= {}

// the get function
handlers._user.get = (data,cb) => {
  // structure the data request get the folder and the file name from the request

  var dataobj  = {
  dir : data.queryStringObject.data,
  item : data.queryStringObject.item,
  token : data.headers.tokenid
  }

  //verifying the token first before proceeding
   handlers.tokens ( dataobj.token, (err) => {

// if no error , you can proceed on the get request
         if (!err){
            _data.read (dataobj.dir,dataobj.item , (err,data) => {
// successfully read the data
               if (!err&&data){
                  data = JSON.parse(data);
                  cb (200 , data)
                  }
            })
          }
   })
}
handlers._user.put = (data,cb)=> {
// verify the token
handlers.tokens (data.headers.tokenid , (err,tokendata)=>{
 if (!err) {
           var tokendata = helpers.parseJsonToObject(tokendata)
   // read the user data
          _data.read ('users',tokendata.user , (err,userdata)=>{
             if (!err) {
       // edit the user data according to to the amendments
                _data.edit ('users',tokendata.user,data.payload,userdata,(err)=>{
    // editing the user data as per the data send
                         if (!err){
                             cb (200,{success:'user data has been updated succesffully'})
                          }
                          else {
                               cb (404,{error:'we couldn update the user data'})
                               }
                 })
              }
           })
 }
 else {
   cb (404,{error:'user isn loggedin '})
 }


})
}

handlers._user.post =(data,cb)=> {
//structure the items added to the cart
    handlers.tokens ( data.headers.tokenid, (err,tokendata) => {
      if (!err){
           var dataobj = {
                    item:[data.payload.item],
                    qty:[data.payload.qty],
                    price:[data.payload.price],
                  }
// adding items to the cart
            // convert the returned data from the token into json object
                tokendata= helpers.parseJsonToObject (tokendata)
               _data.read ('shoppingcart' , tokendata.user , (err , filedata) =>{

                      if (err){
// creating a new shopping cart
                           _data.create ('shoppingcart',tokendata.user, dataobj, (err) =>{
// if no error the item will be added to the shopping cart succesffully
                                  if (!err) {
                                        cb (200 , {item:'added to the shopping cart succesffully'})
                                            }
                              })
                        }
// or add the item in the existing shopping cart
                     else {
                          _data.edit ('shoppingcart' , tokendata.user , dataobj,filedata, (err)=> {
                          })
                          }
                  })
        }
        else {
          cb (401 , {error : 'error u must be logged in to sert in the cart'})
        }
      })
}

handlers.cart = (data,cb) => {
// calling the relevant function from the handlers container
        handlers._cart[data.payload.method](data,cb)
  }
  // container for the handlers for the cart
  handlers._cart = {};
  // the get request for the shopping cart data
  handlers._cart.get = (data,cb)=> {
        var dataobj  = {
            dir : 'shoppingcart',
            token : data.headers.tokenid,
    }
// verifying the token in our server
        handlers.tokens ( dataobj.token, (err,tokendata) => {
          // converting the object returned data into object
          tokendata= helpers.parseJsonToObject (tokendata)
          // get the usder data
          dataobj.user = tokendata.user
// if no error in the verification , you can proceed on the get request
               if (!err){
// read the cart data from the shopping cart directory


                  _data.read (dataobj.dir,dataobj.user , (err,data) => {
// successfully read the data from the shopping cart directory
                       if (!err&&data){

                               // calculating the total value of the order
                            var totalvalue=  helpers.calcordertotal (data);
                            dataobj.totalvalue

                        // add the total value to the shopping cart database
                        console.log ('this is the total value of the order'+ data)

                         _data.edit ('shoppingcart',dataobj.user,dataobj.totalvalue,data, (err,data)=> {
                            console.log ('this is the data that should be returned'+ data)
                         data = helpers.parseJsonToObject(data)
                        cb (200 , {order:data})
                        })
// return back the data to be presented to the customer

                         }
                       })
                    }
         })
}


handlers.tokens = (tokenid , cb)=> {
    _data.read ('tokens',tokenid , (err,data)=>{
    // the token is existing
    if (!err)
    {
      cb (false,data)
    }
    else{
      cb (true)
    }

    })
}

handlers.order = (data,cb)=> {
// construct the data vsadetails
var dataobj = {
  token : data.headers.tokenid,
}

// verifying the user token
handlers.tokens(dataobj.token,(err,result) => {
  // receiving the back the user details from the token folder and assign it in the object container
    var userdetails = helpers.parseJsonToObject (result)
      if (!err) {
    // get the cart details for this user

          _data.read ('shoppingcart' , userdetails.user,(err,data) => {
    // calculate the total value of the cart

            var totalvalue=  helpers.calcordertotal (data);
    // construct he order details that will be sent to stripe server
                 var orderdetails = {
                   user : userdetails.user,
                   amount:totalvalue,
                   description : 'sally order',
                   details : helpers.parseJsonToObject(data)

                 }
            // create the order and pay it for the customer
                  helpers.createCharge (orderdetails,(err ) => {
                         if (!err){
                           // converting the string into object order
                          // create a new order number
                           var ordernumber = (helpers.createOrderNumber ())
                           //write the order number details in the dataobject
                           orderdetails.details.ordernumber = ordernumber
                         // insert the new order into the order folder
                             _data.create ('orders' , ordernumber, orderdetails , (err)=> {
                                    if (!err) {

                                            cb (200 , {success:'Order has been paid successfully'})
                                            _data.read ('users' ,orderdetails.user , (err,data)=>{

                                                     if (!err){
                                                       var userdata = helpers.parseJsonToObject(data);
                                                       // construct the email data that will be sent over the email
                                                       var emaildata = {
                                                         'user':userdata.username,
                                                         'email':userdata.email,
                                                         'on':ordernumber,
                                                         'amount':orderdetails.amount
                                                       }
                                                       helpers.sendPaymentConfirmation(emaildata)
                                                       var newitem = {ordernumber:ordernumber}
                                                        // insert the new order details number into the users data with stripe charge id
                                                        console.log ('inserting new data to the order')
                                                                _data.edit('users',orderdetails.user,newitem,data,(err)=>{

                                                                  // if no error sending an email to the users
                                                                  console.log ('no error has been found')
                                                                })
                                                     }
                                                     else {
                                                       console.log ('error inserting the new data into the order')
                                                     }

                                            })

                                          }
                                    else {
                                             cb (200 , { error : "Error creating the new order"})
                                          }

                             })
                // removing the ordered items from the shopping cart
                             _data.delete('shoppingcart',orderdetails.user,(err)=> {
                                           if (!err){
                                               console.log ('successfully removed the item from the cart')
                                              }
                                           else {
                                               console.log ('error removing the items from the cart')
                                                }
                                                })
                              }
                       // else there was an  error submitting the payment
                         else {
                            cb(400 , {error:'error paying the order'})
                       }
                  })
          })

     }
    else
        {
          cb (504,{error:'user should be logged in'})
        }

   })
}

handlers.logout = (data,cb)=>{
  var dataobj = {
    token : data.headers.tokenid,
  }

  _data.delete('tokens',dataobj.token,(err)=> {
                if (!err){
                    console.log ('successfully removed the item from the cart')
                    cb (200 , {success :'customer has logged out successfully'})
                   }
                else {
                    console.log ('error removing the items from the cart')
                     }
           })


}

module.exports = handlers
