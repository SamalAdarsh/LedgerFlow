const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');


const userRegisterController = async(req,res)=>{
    const{email,password,name} = req.body;

    const isExists = await userModel.findOne({
        email:email,
    })

    if(isExists){
        res.status(422).json({
            message:"User already exists with this email",
            status:"failed"
        })
    }

    const user = await userModel.create({
        email,password,name
    })

    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"3d"});

    res.cookie("token",token);

    res.status(201).json({
        message:"Welcome to LedgerFlow",
        user:{
            _id:user._id,
            email:user.email,
            name:user.name,
        },
        token
        
    })

    await emailService.sendRegistrationEmail(user.email,user.name);


}




module.exports = {userRegisterController};