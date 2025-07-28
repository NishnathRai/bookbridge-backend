const express=require("express");
const {userAuth}=require("../utils/userAuth");
const {BookRequest}=require("../models/booksLent");
const {User}=require("../models/User");


const userRouter=express.Router();

userRouter.get("/user/requests",userAuth,async(req,res)=>{
   try{
     const loggedUser=req.user;

     const allRequests=await BookRequest.find({
        toUserId:loggedUser._id,
        status:"barrow"
     }).populate("fromUserId","firstName lastName photoURL  mobileNumber  gender comments");

     if(allRequests.length===0){
        return res.json({
            message:"No more requests",
            requests:[]
        })
     }

     res.send(allRequests);

   }catch{
     res.status(400).send("Invalid Credentials");
   }
});

userRouter.get("user/lentedbooks",async(req,res)=>{
    try{

        const loggedUser=req.user;

        const allConnectins=await BookRequest.find({
            toUserId:loggedUser._id,
            status:"lent"
        }).populate("fromUserId","firstName lastName photoURL  mobileNumber  gender ");

        if(allConnectins.length===0){
            return res.json({
                message:"You are not lent any books",
                connections:[]
            })
        }

        res.json({
            message:"these are you lented ",
            books:allConnectins
        })

    }catch{
        res.status(400).send("Invalid Credential");
    }
})