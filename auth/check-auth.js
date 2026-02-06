const jwt = require('jsonwebtoken')
const keys = require('../config/keys').keys
module.exports = (req,res,next)=>{
    try{
        const token= req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token,keys)
        req.userData = decoded
        next()
    }catch(error){
        return res.status(200).json({
            title:"error",
            message:'Auth Failed',
            status:false,
            auth:false
        })
    }
    
}