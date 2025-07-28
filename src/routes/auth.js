const express =require("express");

const authRouter=express.Router();
const {User}=require("../models/User");
const bcrypt=require("bcrypt");

authRouter.post("/signup",async(req,res)=>{
    try{
  const{firstName,lastName,emailId, userId, password
        }=req.body;
        const passwordEncrypted=await bcrypt.hash(password,10);

        const user=new User({
            firstName,
            lastName,
            emailId, 
            userId, 
            password:passwordEncrypted,
        })

      const savedUser= await user.save();
      const token=savedUser.getJWT();
  
      res.cookie("token",token,{
        httpOnly:true,
        secure:false,
        maxAge: 24 * 60 * 60 * 1000
      })                
     
      res.send(savedUser);

    }catch(err){
        res.status(400).send("something went wrong , try again!");
    }
});

authRouter.post("/login",async(req,res)=>{
    try{
      const{emailId,password}=req.body;

      const user=await User.findOne({emailId });
      if(!user){
       return res.status(401).send("Invalid Credential");
      }
      const isPassword=await user.validatePassword(password);
      if(!isPassword){
       return res.status(401).send("Invalid Credential");
      }

      const token=user.getJWT();

      res.cookie("token",token,{
        httpOnly:true,
        secure:false,
        maxAge: 24 * 60 * 60 * 1000
      });
      res.send(user);

    }catch{
        res.status(400).send("Invalid Credential");
    }
});
authRouter.get("/logout",(req,res)=>{
    try{
        res.clearCookie("token");
        res.send("you succesfully logout");
    }catch{
        res.status(400).send("bad request");
    }
})


module.exports=authRouter;

