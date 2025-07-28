const express = require("express");
const { connectDB } = require("./confic/databes.js");

const authRouter=require("./routes/auth.js");
const profileRoute=require("../src/routes/profile.js");
const cookieParser = require("cookie-parser");
const bookRequest=require("../src/models/booksLent.js");
const bookRoute=require("../src/routes/books.js");
const{feedRouter}=require("../src/routes/feed.js");
const cors=require("cors");
const http=require("http");
const initializeSocket = require("./utils/socket.js");
const chatRouter = require("./routes/chat.js");
const app = express();
app.use(express.json());  
app.use(cookieParser());
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true,
}));         
app.use("/",authRouter);
app.use("/",profileRoute);
app.use("/",bookRoute);
app.use("/",feedRouter);
app.use('/',chatRouter);

const server=http.createServer(app);

initializeSocket(server);
 
connectDB()
  .then(() => {
    server.listen(8080, () => {
      console.log("Server running on port 8080");
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
  });

