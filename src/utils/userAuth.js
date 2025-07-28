const jwt=require("jsonwebtoken");
const {User}=require("../models/User");

const userAuth=async(req,res,next)=>{
    try{
        const {token}=req.cookies;
        const decodedObj=await jwt.verify(token,"lets increase our potential");
        const {_id}=decodedObj;
        const user=await User.findById(_id);
        if(!user){
            return res.status(400).send("Bad request");
        }
        req.user=user;  
        next();
    }catch{
        return res.status(400).send("Bad ,,,, request");
    }
}

module.exports={userAuth};