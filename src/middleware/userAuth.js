const jwt = require('jsonwebtoken')
const User = require('../models/user')
const userAuth = async(req,res,next)=>{
    try {
        // console.log(req.useragent)
        const auth_token = req.headers.authorization
        if(!auth_token) throw new Error('login to continue')
        const { _id } = jwt.verify(auth_token,process.env.JWT_SECRET)
        if (!_id) throw new Error('login to continue')
        const user = await User.findOne({_id})
        const isValidToken = user.tokens.findIndex((token)=>token.token === auth_token)
        if(isValidToken < 0) throw new Error ('logged out from this devie , login again to continue')
        req.user = user
        next()
    } catch (e) {
        res.json({
            success:false,
            message:'failed',
            error:e.message,
            status: 404
        })
    }
}

module.exports = userAuth