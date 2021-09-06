require('dotenv').config()

const express = require('express')
console.log(process.env)

const path = require('path')
const app = express()
const moment = require('moment')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const { fstat } = require('fs')
// -------------------------------------------------------------------

const storage = multer.diskStorage({
    destination: (req , file , cb) => {
        cb(null , './Profile_Images/')
    },

    filename: (req , file , cb) => {
        console.log(file)
        cb(null , path.extname(file.originalname))
    }
})

const uploadimg = multer({storage:storage})

// -------------------------------------------------------------------
app.use(express.json())

const userdetails = []

app.get('/user' , authToken , (req , res) => {

    // res.json(userdetails);

    res.json(userdetails.filter(tmpuser => tmpuser.name === req.user.name))
})


app.get('/user/:id' , (req , res) => {

    res.json(userdetails.filter(specificUser => specificUser.name === parseInt(req.params.name)))

    const specificUser = userdetails.find(specific => specific.name === req.body.name)
    if(specificUser == null){
        res.send("No such user exist ...")
    }
    else(!specificUser)
     return res.json(specificUser);


})

app.put('/:id' , async (req , res) => {
    // console.log('Put method')
    const updateUser = userdetails.find(updateUser => {
        updateUser.name = req.body.name,
        updateUser.email = req.body.email,
        updateUser.mobile = req.body.mobile
    
    })
})

const fs = require('fs');
const { json } = require('body-parser')
const { hasSubscribers } = require('diagnostics_channel')
const { config } = require('dotenv')
app.post('/user' , async (req , res) => {
    try{

        const hashedpass = await bcrypt.hash(req.body.password , 10)
        const userparams  = {id: req.body.id, name : req.body.name , 
        email : req.body.email , mobile : req.body.mobile ,
        password : hashedpass,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/Profile_Images/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
        res.send(req.file)
        userdetails.push(userparams);
        res.status(201).send();

}

    catch{
        res.status(500).send("Error occured !!");

    }    
})


app.post('/user/login'  ,async (req , res) => {
    const userFind = userdetails.find(userFind => userFind.name === req.body.name)

    if(userFind == null){
        return res.status(400).send("User not available !");
    }
    try{
        if(await bcrypt.compare(req.body.password , userFind.password)){

            res.send("Login successful ")
        }

        else{
            res.send('Invalid Password')
        }

        const name = req.body.name
        const user = {name:name}
        const accessToken =  jwt.sign(user , process.env.ACCESS_TOKEN_SECRET)
        res.json({accessToken:accessToken})
    }

    
    catch{
        res.status(500).send();
    }
})

function authToken(req , res , next){

    const header = req.headers['authorization']
    const token = header && header.split(' ')[1]
    if(token == null){
        return res.sendStatus(401)
    }

    jwt.verify(token , process.env.ACCESS_TOKEN_SECRET , (err , user) => {
        if (err)
        return res.sendStatus(403);
        req.user = user;
        next();
    })

}


app.post('/forgot' , async (res,req) =>{
    const user = userdetails.findOne(user => user.email === req.body.email);
    if(user == null)
    return res.send("No such email address");

    const token  = crypto.randomBytes(32).toStrin('hex')
    bcrypt.hash(token , null , null , function(err , hash){
        ChangePass.create({
            resetPasswordToken : hash,
            expire : moment.utc().add(config.tokenExpiry , 'seconds')
        })
    })

} )
const port =process.env.PORT || 8080

app.listen(port , ()=>{
    console.log("Server started on port ::" , port)
})

