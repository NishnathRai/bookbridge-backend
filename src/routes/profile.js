const express=require("express");
const {userAuth}=require("../utils/userAuth");
const profileRoute=express.Router();
const {validateEditProfileData}=require("../utils/validation");
const { User } = require("../models/User");

profileRoute.get("/profile",userAuth,(req,res)=>{
    try{
        const user=req.user;
        res.send(user);
    }catch{
        res.status(400).send("Bad Request");
    }
});

profileRoute.patch("/profile/edit",userAuth,async(req,res)=>{
    try{
        if(!validateEditProfileData(req)){
            return res.status(400).send("You cann't edit this feild");
        }
        const user=req.user;
        Object.keys(req.body).forEach((key)=>(user[key]=req.body[key]));
        await user.save();
        res.send(user);
    
    }catch(err){
        console.log(err);
        return res.status(400).send("Something went wrong");
    }
});
profileRoute.patch("/profile/comments/:toUserId",userAuth,async(req,res)=>{
    try{
       const user=req.user;
       const toUserId=req.params.toUserId;
       const toUser=await User.findById(toUserId);

       if(!toUser){
        res.status(400).send("user is not found");
       }

       const {comments}=req.body;
       if(!comments || (Array.isArray(comments) && comments.length===0)){
        return res.status(400).send("No comments provided");
       }

       if(Array.isArray(comments)){
        toUser.comments.push(...comments);
       }else{
        toUser.comments.push(comments);
       }

       await toUser.save();
       res.send({ message: "Comment(s) added successfully", comments: toUser.comments });

    }catch{
        res.status(400).send("Invalid Credentials");
    }
});

profileRoute.get("/toUserProfile/:toUserId",userAuth,async(req,res)=>{
    try{
       const toUserId=req.params.toUserId;
       const toUser=await User.findById(toUserId);
       if(!toUser){
        return res.status(400).send("Invalid Credentia")
       }
       res.send(toUser);
    }catch{
        res.status(400).send("Invalid Credentials");
    }
})

module.exports=profileRoute;