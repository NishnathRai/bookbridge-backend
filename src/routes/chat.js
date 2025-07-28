
const express=require("express");
const { userAuth } = require("../utils/userAuth");
const { Chat } = require("../models/chat");

const chatRouter=express.Router();

chatRouter.get("/chat/:targetUserId",userAuth,async(req,res)=>{
    try{

        const loggedUserId=req.user._id;
        const {targetUserId}=req.params;

        let chat =await Chat.findOne({
            participates:{$all:[loggedUserId,targetUserId]},
        }).populate({
            path:"messages.senderId",
            select:"firstName lastName photoURL"

        })
        if(!chat){
            chat=new Chat({
                participates:[loggedUserId,targetUserId],
                messages:[]
            });
            await chat.save();
        }
        res.send(chat);

    }
    catch(err){
        console.log(err);
    }
})

module.exports=chatRouter;
