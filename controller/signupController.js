const User = require('../model/UserModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config()

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body
        const user = await User.findOne({ where: { email } })
        if (user) {
            return res.status(400).json({ message: 'User already exists' })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name:name,
            email:email,
            password: hashedPassword
        })
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },  
            process.env.JWT_KEY,                   
        )

        res.status(201).json({ user: { id: newUser.id, name: newUser.name, email: newUser.email }, message: 'New user created succesfully',token })

    }
    catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error while signing up' })
    }
}

exports.login = async(req, res) => {
    try{
        const {email,password}=req.body;
        const user=await User.findOne({where:{email}})
        if(!user){
            return res.status(400).json({message:'User does not exists'})
        }
        const checkPass=await bcrypt.compare(password,user.password)
        if(!checkPass){
            return res.status(400).json({message:"Invalid credentials"})
        }
        const token=jwt.sign(
            { id: user.id, email: user.email },  
            process.env.JWT_KEY,                   
        )
        res.status(200).json({token,message:"User successfully logged in",user: { id: user.id, name: user.name, email: user.email }})
    }
    catch(err){
        console.error(err)
        res.status(500).json({message:"Error while logging in"})
    }
}