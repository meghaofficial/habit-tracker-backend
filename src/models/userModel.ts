import mongoose from "mongoose";

interface IUser {
  username: string;
  email: string;
  password?: string;
  provider?: "local" | "google" | "github" | "twitter";
  providerId?: string; // id from OAuth provider
  refreshToken: string;
  resetPasswordToken?: String,
  resetPasswordExpire?: Date,
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true, lowercase: true },
  password: { type: String, trim: true },
  provider: { type: String, enum: ["local", "google", "github", "twitter"], default: "local" },
  providerId: { type: String },
  refreshToken: { type: String, default: "" },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
}, { timestamps: true });

const User = mongoose.model<IUser>("user", userSchema);

export default User;