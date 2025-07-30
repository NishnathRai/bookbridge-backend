const socket=require("socket.io");
const { Chat } = require("../models/chat");


const initializeSocket=(server)=>{
    
    const io=socket(server,{
      cors:{
        origin:"*"
      }
    })
    
    io.on("connection",(socket)=>{
   socket.on("joinChat",({loggedUserId,targetUserId})=>{
  
    const roomId=[loggedUserId,targetUserId].sort().join("_");
   socket.join(roomId)

   });

   socket.on("sendMessage",async({firstName,loggedUserId,targetUserId,text,PhotoURL})=>{
    try{
    const roomId=[loggedUserId,targetUserId].sort().join("_");


        let chat = await Chat.findOne({
            participates: { $all: [loggedUserId, targetUserId] }
        });
        
        if (!chat) {
          chat = new Chat({
            participates: [loggedUserId, targetUserId],
            messages: []
          });
        }
        chat.messages.push({
            senderId:loggedUserId,
            text
        })
      const rr=  await chat.save();
    

 io.to(roomId).emit("messageReceived",{firstName,text,PhotoURL})


    }
    catch(err){
        console.log(err);
    }
   });

   socket.on("disconnect",()=>{});


    })
};
module.exports=initializeSocket;