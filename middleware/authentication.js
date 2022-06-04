const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors')

const auth = async (req, res, next) => {
    try {
        const token=req.header("Authorization")
        if(!token) return res.status(401).json({msg:"INVALID authentication"})
        jwt.verify(token,process.env.JWT_SECRET,async(err,user)=>{
            if(err) return res.status(400).json({msg:"INVALID authentication"})
            req.user=await User.findById(user.userId) // to used in get user in UserCtrl.js in function getUser
            
            next()
        })
    } catch (error) {
        return res.status(400).json({msg:error.message})
    }
}

module.exports = auth