const mongoose = require("mongoose");

const booksSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ["barrow", "lent", "rejected"],
      message: `{VALUE} field is incorrect`
    }
  },
  book:{
    name:{
      type:String,
      required:true
    },
    bookImage:{
      type:String,
    }
  }
}, {
  timestamps: true
});

booksSchema.pre("save", function (next) {
  if (this.fromUserId.equals(this.toUserId)) {
    return next(new Error("Users cannot send requests to themselves."));
  }
  next();
});

const BookRequest = mongoose.model("BookRequest", booksSchema);
module.exports = { BookRequest };
