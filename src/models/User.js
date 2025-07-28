const mongoose=require("mongoose");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");

const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minLength:4,
        maxLength:20
    },
    lastName:{
        type:String,
        required:true,
    },
    age:{
        type:String,
        default:"-/"
    },
    education:{
        type:String,
        default:"-/"
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowerCase:true
    },
    userId: {
        type: String,
        unique: true,
        trim: true,
    }
    ,
    password:{
        type:String,
        required:true
    },
    photoURL:{
        type:String,
        default:"https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
    },
    mobileNumber:{
       type:Number,
       default:101
    },
    gender:{
        type:String,
        enum:{
            values:["male","female","other",""],
            message:`{VALUE} wrong feild`
        },
    },
    about:{
        type:String,
    },
    booksForLend: [{
        name: { type: String, required: true },
        bookImage: { type: String },
        isAvailable: { type: Boolean, default: true },
        lentTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
      }],
    booksLented:[{
        name: { type: String, required: true },
        bookImage: { type: String ,
            default:"https://static.vecteezy.com/system/resources/previews/004/557/296/non_2x/brown-book-with-book-mark-vector.jpg"
        },
        isAvailable: { type: Boolean, default: true },
        lentTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
    }],
    booksBarrowed: [{
        name: { type: String, required: true },
        bookImage: { type: String },
        isAvailable: { type: Boolean, default: true },
        barrowFrom: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
      }],
    comments:{
        type:[String]
    }
});
// --- schema fix ---
userSchema.pre("save", function (next) {
    if (this.emailId) this.emailId = this.emailId.toLowerCase();
    next();
  });
  
  userSchema.methods.validatePassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
  };
  
  userSchema.methods.getJWT = function () {
    return jwt.sign({ _id: this._id }, "lets increase our potential", {
      expiresIn: "1d",
    });
  };
  
  const User = mongoose.model("User", userSchema);
  module.exports = { User };
  