const express = require('express')
const app = express()
const mongoose = require('mongoose')
var bodyParser = require('body-parser')
const  userModel = require('./models/userModel')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
require('dotenv').config()
const path = require('path')
const port = process.env.PORT || 5000;

app.use('/' , express.static(__dirname + '/public'))


// mongoose.connect(process.env.DB_URL_LIVE).then(res=>console.log('compass db connected')).catch(err => console.log(err))
 mongoose.connect("mongodb+srv://asim:mardan@cluster0.btwlh.mongodb.net/fatimahh?retryWrites=true&w=majority").then(res=>console.log('atlass db connecteed')).catch(err => console.log(err))

 app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))


app.use(bodyParser.urlencoded({ extended: false }))
app.set("view engine" , "ejs")
app.use(cookieParser())


const checkUser = async(req ,res , next) =>{
  const userId = req.cookies.userId
  console.log(userId)
  if(userId){
    const user = await userModel.findById(userId)
    return res.render('Homepage' , { user : user})
  }
  next()
}






app.get("/" , checkUser,async(req ,res) =>{
  console.log(req.cookies)
  res.render('Homepage' , {user: null})
})



app.get("/login"  ,  async(req ,res) =>{
 res.render('LoginPage' , {err : null})
})



app.get("/community"  ,  async(req ,res) =>{
  res.send('community page')
  // res.render('LoginPage' , {err : null})
 })

 
app.get("/contact"  ,  async(req ,res) =>{
  res.render('ContactUsPage')
 })



app.get("/register"  ,  async(req ,res) =>{
  res.render('SignupPage')
 })
 



app.post("/register" , async(req ,res) =>{
  const {name , email , password} = req.body
  console.log(req.body)
  const hashPassword = await bcrypt.hash(password , 10)
  const data  = new userModel({
    name,
    email ,
    password : hashPassword
  })

  if(name === ""  || email === "" ){
    req.flash('error' , "Fill All Fields Properly !")
    return res.redirect('/register')
  }
  try {
    const findUser = await userModel.findOne({email : email})
    if(findUser){
      req.flash('error'  , 'user alraedy')
     res.redirect('/register')
    }
    const newUser =  await data.save()
    res.redirect("/login")
  } catch (error) {
    console.log(error)
    res.send({error})
  }

})


app.post('/login', async(req , res , done)=>{
const {email , password} = req.body
const user = await userModel.findOne({email})
if (!user) { return res.render("LoginPage" , {err : "No User Found"})}
if (! await bcrypt.compare(password ,user.password)) { return res.render("LoginPage" , {err : "Wrong Credintials"})}
res.cookie('userId'  , user._id)
res.render('Homepage' , {user: user})
});








app.listen(port , ()=>{
    console.log(`server is running on port ${port} , http://localhost:${port}`)
})
