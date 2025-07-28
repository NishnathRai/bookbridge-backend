const express=require("express");
const bookRoute=express.Router();

const {userAuth}=require("../utils/userAuth");
const {BookRequest}=require("../models/booksLent");
const {User}=require("../models/User");


bookRoute.post("/request/send/:status/:toUserId",userAuth,async(req,res)=>{
    try{
      const fromUserId=req.user._id;
      const toUserId=req.params.toUserId;
      const status=req.params.status || "";
      const { bookName, bookImage } = req.body;
      if(status!="barrow"){
        return res.status(404).send("request not found");
      }

      const toUser=await User.findById(toUserId);

      const book =toUser.booksForLend.find((b)=>b.name==bookName && b.isAvailable);

      if(!book){
        return res.send("Book is not avaliable");
      }

    const existConnection=await BookRequest.findOne({
        fromUserId,toUserId,
        status: "barrow",
        "book.name":bookName
    })
    if(existConnection){
        return res.send("You already requested this book.");
    }

    const newConnection=new BookRequest(
        {fromUserId,
        toUserId,
        status,
        book:{
            name:bookName,
            bookImage:bookImage
        }
        });
    await newConnection.save();

    res.send(`You succesfully send a request to ${toUser.firstName}`);

    }catch{
        res.status(400).send("You cannt make this request");
    }
});

bookRoute.post("/request/review/:status/:toUserId",userAuth,async(req,res)=>{
    try{
        const fromUserId=req.user._id;
        const toUserId=req.params.toUserId;
        const status=req.params.status;
        const { bookName } = req.body;
        const allowed=["lent", "rejected"];
    

        if(!allowed.includes(status)){
            return res.send("Invalid credentials");
        }

        const request = await BookRequest.findOne({
            fromUserId: toUserId,
            toUserId: fromUserId,
            status: "barrow",
            "book.name": bookName 
          });
       if(!request){
         return res.send("No request");
       }
    
       const owner = await User.findById(fromUserId);
       const book = owner.booksForLend.find(b => b.name === bookName);
       if (!book) {
        return res.send("Book not found");
      }
  
      if (!book.isAvailable) {
        return res.send("Book already lent");
      }
   
       if (status === "lent") {
        book.isAvailable = false;
        book.lentTo = toUserId;
        await owner.save();

        const user22 = await User.findById(fromUserId);
        user22.booksLented.push({
          name: book.name,
          bookImage: book.bookImage,
          isAvailable: false,
          lentTo: toUserId
        });
        await user22.save();

        const toUser=await User.findById(toUserId);
        toUser.booksBarrowed.push({
            name:bookName,
            bookImage:book.bookImage,
            isAvailable:true,
            barrowFrom:fromUserId

        });
        await toUser.save();
      }
  
      request.status = status;
     const ww= await request.save();

       res.send(`Request successfully ${status}`);

    }
    catch(err){
        res.status(400).send(err);
    }
});

bookRoute.post("/request/return/:toUserId", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    const toUserId = req.params.toUserId;
    const { bookName } = req.body;

    const owner = await User.findById(toUserId);

    if (!owner) {
      return res.send("Owner not found");
    }

    const lentBook = owner.booksLented.find(
      (b) => b.name === bookName && !b.isAvailable && b.lentTo.toString() === loggedUser._id.toString()
    );

    if (!lentBook) {
      return res.send("Book is not found or already returned");
    }

    const borrowedBook = loggedUser.booksBarrowed.find(
      (b) => b.name === bookName && b.isAvailable
    );

    if (!borrowedBook) {
      return res.send("Borrowed book not found in your records");
    }

    const request = await BookRequest.findOne({
      fromUserId: loggedUser._id,
      toUserId,
      status: "lent",
      "book.name": bookName
    });

    if (!request) {
      return res.send("You have not borrowed this book from this user");
    }

    // Update owner booksForLend
    const lendBack = owner.booksForLend.find((b) => b.name === bookName);
    if (lendBack) {
      lendBack.isAvailable = true;
    }

    // Remove or mark the lent book as returned
    owner.booksLented = owner.booksLented.filter((b) => b.name !== bookName);

    // Update borrower's booksBarrowed
    borrowedBook.isAvailable = false;

    await owner.save();
    await loggedUser.save();

    res.send(`${loggedUser.firstName} has successfully returned ${bookName}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
});


module.exports=bookRoute;