const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()

app.use(express.static('public'))
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
//mongodb
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const {Schema} = mongoose;

//Created exerciseSchema
const exerciseSchema = new Schema({
  username: String,
  count: Number,
  log : [Object]
});

//create a model called Exercise from the exerciseSchema
const Exercise=mongoose.model("Exercise", exerciseSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


//create a New User
app.post('/api/users', (req, res,done) => {
  const {username} = req.body;

  let createNewUser = new Exercise({
    username:username,
    count:0,
    log:[]
    });

  //find if exist
  Exercise.findOne({username: username}, (err, data)=> {
    if (!err) return console.log("User Exist")
    done(null, data);
  });
  //since not exist, create
  createNewUser.save(function(err, data) {
    if (err) return console.error(err);
    done(null, data)
  });
  //response after create
  res.json({
    username: createNewUser.username,
    _id: createNewUser._id
  });
});

//list all user available
app.get('/api/users', (req, res,done) => {
  let arr;
  Exercise.find()
  .select({
    count: 0 ,__v:0,log:0
  })
  .exec((err, data)=> {
    if(err) {done(err)};
    res.json(data);
    done(null, data);
  });
});

//add exercise
app.post('/api/users/:_id/exercises', (req, res,done) => {
  //obtain from index html
  let {description,duration,date} = req.body;
  let {_id} = req.params;

  if (!date){
    date = new Date();
    date = date.toDateString();
  }else{
    date = new Date(date);
    date = date.toDateString();
  };

  //update by adding exercises submitted
  const exercise = Exercise.findById(_id, (err, exercise) => {
    if (err) return console.log(err);
    if (!exercise){return res.json({"_id":"unfound"})};

    exercise.count++;

    exercise.log.push({
      description,
      duration,
      date
    });
    
    res.json({
    _id: _id,
    username: exercise.username,
    date,
    duration: parseInt(duration),
    description
    });
    
    exercise.save((err, updatedPerson) => {
      if(err) return console.log(err);
      done(null, updatedPerson)
    });
  });
});

//list log
//Logs Endpoint
app.get("/api/users/:_id/logs",async(req,res)=>{
  if(req.params._id){
    await Exercise.findById(req.params._id,(err,result)=>{
    if(!err){
      let responseObj={}
      responseObj["_id"]=result._id
      responseObj["username"]=result.username
      responseObj["count"]=result.log.length
      
      if(req.query.limit){
        responseObj["log"]=result.log.slice(0,req.query.limit)
      }else{
        responseObj["log"]=result.log.map(log=>({
        description:log.description,
        duration:parseInt(log.duration),
        date:new Date(log.date).toDateString()
      }))
      }
      if(req.query.from||req.query.to){
        let fromDate=new Date(0)
        let toDate=new Date()
        if(req.query.from){
          fromDate=new Date(req.query.from)
        }
        if(req.query.to){
          toDate=new Date(req.query.to)
        }
        fromDate=fromDate.getTime()
        toDate=toDate.getTime()
        responseObj["log"]=result.log.filter((session)=>{
          let sessionDate=new Date(session.date).getTime()

          return sessionDate>=fromDate&&sessionDate<=toDate
        })
      }
      res.json(responseObj)
    }else{
      res.json({err:err})
    }
  })
  }else{
    res.json({user:"user not found with this id"})
  }
})
/*
app.get('/api/users/:_id/logs', (req, res,done) => {
  const {_id} = req.params;
  let {from, to, limit}= req.query;


  Exercise.findById(_id, (err, exercise) => {
    if (err) return console.log(err);
    if (!exercise){return res.json({"_id":"unfound"})};

    exercise.log.map(a=>a.duration=parseInt(a.duration));
    exercise.log.
    
    res.json({
      _id: _id,
      username: exercise.username,
      count: parseInt(exercise.count),
      log: exercise.log
    });
    
    done(null, exercise);
  });
});
*/
//****************************************/


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
