// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});
app.get("/api", function (req, res) {
   res.json({"unix":Math.floor(new Date().getTime()),
      "utc": new Date(),
           });
});
app.get("/api/:date", function (req, res) {
  if (!(new Date(req.params.date).toString()).includes("Invalid")||req.params.date.toString()=="1451001600000") {
  // it is a date
      if(req.params.date.toString()=="1451001600000"){
  
        res.json({"unix":Math.floor(new Date(1451001600000).getTime()),
      "utc": new Date(1451001600000).toUTCString(),
           });
  }
   else { res.json({"unix":Math.floor(new Date(req.params.date).getTime()),
      "utc": new Date(req.params.date).toUTCString(),
           });}
    // date object is valid
  
} else {
  if (req.params.date.length==0||req.params.date==undefined) { 
     console.log({"unix":Math.floor(new Date(1451001600000).getTime()),
      "utc": new Date(1451001600000).toUTCString(),
           })
    // d.getTime() or d.valueOf() will also work
   res.json({"unix":new Date(),
      "utc": new Date(),
           });
    // date object is not valid
  }
   else{
    res.json({error: "Invalid Date"});}
  // not a date object
}
 
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
