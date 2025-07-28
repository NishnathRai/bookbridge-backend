const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://madhuamma9133:bQKugjqkRAjxsFOx@cluster0.a2xqfdo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
};

module.exports = { connectDB };
