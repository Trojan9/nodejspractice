const express=require('express')
const path=require('path')
const bodyParser=require('body-parser')
const app=express()

const User=require('./model/user')
const bcrypt=require('bcryptjs')
const mongoose = require('mongoose')
const jwt=require('jsonwebtoken')
const url = `mongodb+srv://timmy:oluwatimmy@cluster0.olhtf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const JWT_SECRET_KEY="SJKDHDH$5FSRTV6789@#$%^&*(HDGDFDBFJHFN}BGGDG{JDHTEGDMD"
//WE HAVE TO TAKE RESPONSIBILITY FOR THIS MAKE SURE NO ONE HAS ACCESS TO THIS SECRETkEY,AND MAKE SURE IT DOSENT CHANGE ,ELSE ALL USERS TOKEN BECOMES INVALID
const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })
app.use('/',express.static(path.join(__dirname,'static')))
app.use(bodyParser.json())
app.post('/api/change-password',async(req,res)=>{
    const {newpassword:passwordPlainText,token}=req.body
    if(!passwordPlainText||typeof passwordPlainText !=="string"){
        return res.json({status:"error",message:"Invalid Password"})
    }
    if(passwordPlainText.length<3){
        return res.json({status:"error",message:"Password too short, should be atleast 3 characters"})
    }
    
    try{
        //we extract the user info from the hashedtoken
        const userfromjwt=jwt.verify(token,JWT_SECRET_KEY)
        //we get the id which we will use to retriev user from mongodb
        const _id=userfromjwt.id
        //we hash the new password
        const hashedpassword=await bcrypt.hash(passwordPlainText,10)
        //then we update the userpass
        await User.updateOne({_id},{
            $set:{password:hashedpassword}
        })
        return res.json({status:"Ok",message:"Password Changed Successfully"})
    }catch(error){
        return res.json({status:"error",message:"Authentication Failed"})
    }
})
app.post('/api/login',async(req,res)=>{
    const {username,password}=req.body

    const user=await User.findOne({username}).lean()//this lean help shorten it to what we need and not all the unneccessary mongoose methods
   if(!user){
    return res.json({status:"error",message:"Invalid Username or Password"})
   }
    if(await bcrypt.compare(password,user.password)){
        //since we cannot get the same encrypted password as the one we stored on the db i.e for every time we encrpyt the same words ,we will get different encrpytions..so we need a way to compare the present password to the one in the database
        const token=jwt.sign({
            id:user._id,
            username:user.username,
        },JWT_SECRET_KEY)
        return res.json({status:"Ok",data:token})
    }
    return res.json({status:"error",message:"Invalid Username or Password"})
})
app.post('/api/register',async(req,res)=>{
    const {username,password:passwordPlainText}=req.body//this will get password and store in passwordplaintext
    if(!username||typeof username !=="string"){
        return res.json({status:"error",message:"Invalid Username"})
    }
    if(!passwordPlainText||typeof passwordPlainText !=="string"){
        return res.json({status:"error",message:"Invalid Password"})
    }
    if(passwordPlainText.length<3){
        return res.json({status:"error",message:"Password too short, should be atleast 3 characters"})
    }
    const password=await bcrypt.hash(passwordPlainText,10)
    console.log(password)
    //note to store our password it is common practice to hash our passwords for a level of user security
//we can use bcrypt, md5, sha1,sha256,sha512
//1.collision should be improbable
//2. algorithms should be slow
//hashing_function()->3436464hbdgfhfnbfhdyhq@#444547
//hashing password

//now to creat user in the database
try{
    const response=await User.create({
        username,password
    })
    console.log("User Created Successfully",response)
    return res.json({status:"OK",message:"User Created Successfully"})
}catch(error){
    //to know the error from the mongoose they use error codes
    if(error.code===11000){
        return res.json({status:"error",message:"Username already exist"})
    }else{
        throw error
        
    }
    //  console.log(JSON.stringify(error))//this will output error in json format and even show the error code from mongodb
    // res.json({status:error.message})

}
   
})

app.listen(9999,()=>{
    console.log('sever up at 9999')
    
})