
var fs = require ('fs')
var path = require('path')
var helpers = require ('./helpers')

// initiating the lib objects that will contain the below functions
var lib = {};

//create the path for the file
lib.baseDir = path.join(__dirname,'/../.data/')
// write a new file in the data folder
lib.create  = (dir,filename,data,cb) => {
// open the file for writing and get the file name
         fs.open(lib.baseDir+dir+'/'+filename+'.json' , 'wx' , (err,filedesc)=>{
  // if no error operning the new file
                if(!err && filedesc){
    //stringifying the _data for writing in the fileDesc
                var stringData = JSON.stringify(data);
  //write the data to the new file
                     fs.writeFile(filedesc,stringData,(err)=>{
                            if (!err) {
  // if no error writing the data to the new file
                                fs.close (filedesc, (err) => {
// if no error closing the file
                                    if (!err) {
// return new error means user has been created successfully
                                          cb (false)
                                        }
                                    else {
                                          cb (409,'Error closing to the file')
                                          }
                                  })
                             }
                             else {
                                    cb(505 , "Error writing to the file")
                                   }
                        })
                 }
                 else {
                      cb (504 , 'error opening the file')
                    }

            })
}

// reading from the folders
lib.read = (dir , file , cb)=>{
     fs.readFile (lib.baseDir+dir + '/' + file + '.json' , 'utf-8' , (err,data) =>{

            if (!err && data){
                     cb (false , data)
                        }
            else {
                 cb (err)
                 }
      })
}

lib.edit = (dir , filename ,newitem,existitem, cb ) => {
// convert the items inside the cart into json object
           existitem = JSON.parse(existitem);

// puhsing the new added items dataobj
        if (newitem.item || newitem.qty|| newitem.price){
                           existitem.item.push(newitem.item[0])
                           existitem.qty.push(newitem.qty[0])
                           existitem.price.push(newitem.price[0])
                         }

        else if (newitem.ordernumber){
                          console.log ('pushing the new order number and stripe charge id in the user folder')
                          // adding the order number values to the order details
                          existitem.orders.push(newitem.ordernumber )
              }
        else if (newitem.totalvalue){
                          existitem.total = newitem,totalvalue

             }
          else {
            existitem.username=newitem.username
            existitem.address=newitem.address
            existitem.email = newitem.email
          }

// stringifying the data to be added in the file
           var stringData = JSON.stringify(existitem);
// opening the existing file
        console.log ('this is the new existing item file '+ stringData)
         fs.open(lib.baseDir+dir+'/'+filename+'.json' , 'r+' , (err,filedesc)=>{

// rewriting the file again with the new data
         fs.truncate(filedesc , (err) =>{
// no error truncating the file
                   if (!err) {
    // writing the data inside the file
                        fs.writeFile(filedesc,stringData,(err)=>{
                           if(!err) {
                                cb (true,stringData)
                                    }
                         })
                       }
                  else {
                    console.log ('error writing to the file ' + err)
                  }
           })
         })
         }

lib.delete = (dir,filename ,cb)=> {
// write the file path for the file u want to remove
 var filepath = lib.baseDir+dir+'/'+filename+'.json'

     // remove the file
     console.log ('this is the file path '+ filepath)
     fs.unlink (filepath , (err)=> {
       if (!err) {
         cb (false)
         console.log ('file deleted successfully')
       }
       else {
         console.log ('error deleting the file')
         cb (true)
       }
     })

}
module.exports = lib;
