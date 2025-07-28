const express=require("express");
const {userAuth}=require("../utils/userAuth");
const feedRouter=express.Router();
const {BookRequest}=require("../models/booksLent");
const {User}=require("../models/User");


feedRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const currentUserId = req.user._id;


    const requestedBooks = await BookRequest.find({
      fromUserId: currentUserId,
      status: "barrow"
    });

    // Build a Set of strings like `${toUserId}_${bookName}` for fast lookup
    const requestedSet = new Set(
      requestedBooks.map(r => `${r.toUserId}_${r.book.name}`)
    );

    // Step 2: Aggregate available books from other users, excluding those already requested
    const allUsersWithAvailableBooks = await User.aggregate([
      {
        $match: {
          _id: { $ne: currentUserId }
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          photoURL: 1,
          booksForLend: 1
        }
      }
    ]);

    const filteredFeed = allUsersWithAvailableBooks.map(user => {
      const filteredBooks = user.booksForLend.filter(book =>
        book.isAvailable && !requestedSet.has(`${user._id}_${book.name}`)
      );
      return {
        ...user,
        booksForLend: filteredBooks
      };
    }).filter(user => user.booksForLend.length > 0); 

    res.send(filteredFeed);
  } catch (err) {
    console.error(err);
    res.status(400).send("Invalid Credentials");
  }
});

feedRouter.get("/user/borrowBooks",userAuth,async(req,res)=>{
    try{
        const user = await User.findById(req.user._id)
        .populate("booksBarrowed.barrowFrom", "firstName emailId");
  
      if (!user || user.booksBarrowed.length === 0) {
        return res.send("You have not borrowed any books.");
      }
      const filterBorrowBooks=user.booksBarrowed.filter((b)=>b.isAvailable===true);
      res.send(filterBorrowBooks);


    }catch{
        res.send("Invalid Credentials");
    }
});

feedRouter.get("/user/lented",userAuth,async(req,res)=>{
    try{
        const user= await User.findById(req.user._id)
        .populate("booksLented.lentTo", "firstName emailId  photoURL");
        const lentedBooks=user.booksLented;
        if(lentedBooks.length==0){
            return res.send("Currently you are no more books lented");
        }
        const filterlentBook=lentedBooks.filter((b)=>b.isAvailable===false);
        res.send(filterlentBook);
    }catch{
        res.send("Invalid Credentials");
    }
})

feedRouter.get("/user/requests",userAuth,async(req,res)=>{
  try{
     const userId =req.user._id;
     const requestBooks=await BookRequest.find({fromUserId:userId,status:"barrow"}).populate("toUserId", "firstName emailId");

     const filterbooks=requestBooks.filter((b)=>b.isAvailable===true);
     res.send(requestBooks);
  }catch{
    res.status(400).send("Invalid Creadentials");
  }
});
feedRouter.get("/user/books",userAuth,async(req,res)=>{
  try{
   
    const user=req.user;

    const booksForLend= user?.booksForLend.filter((book)=>book.isAvailable==true);
    res.send(booksForLend);


  }
  catch{
    res.status(400).send("Invalid Credentials");
  }
});

feedRouter.get("/user/inbox",userAuth,async(req,res)=>{
  try{
    const fromUserId=req.user._id;
    const inbox=await BookRequest.find({
      toUserId:fromUserId,
      status:"barrow",
    }).populate("fromUserId","firstName lastName  photoURL");
    res.send(inbox);
  }catch{
    res.status(400).send("Invalid Credentials");
  }
})

module.exports={feedRouter};