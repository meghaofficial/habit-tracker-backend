import mongoose from "mongoose";

export const connectDB = async (url: string) => {
  try {
    const conn = await mongoose.connect(url);
    console.log("Mongo connected ", conn.connection.host);
  } catch (error) {
    console.error('Problem connecting with DB: ', error);
  }
}

mongoose.connection.on("connected", () => {
    console.log("MongoDB Connected");
});

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB Disconnected");
});

mongoose.connection.on("reconnected", () => {
    console.log("MongoDB Reconnected");
});

mongoose.connection.on("error", (err) => {
    console.error("Mongo Error:", err);
});