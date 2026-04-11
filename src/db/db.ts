import mongoose from "mongoose";

export const connectDB = async (url: string) => {
  try {
    const conn = await mongoose.connect(url);
    console.log("Mongo connected ", conn.connection.host);
  } catch (error) {
    console.error('Problem connecting with DB: ', error);
  }
}