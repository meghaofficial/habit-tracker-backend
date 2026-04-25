import mongoose from "mongoose";

interface IRefreshToken {
  token: String;
  createdAt: Date;
  expiresAt: Date;
}

const RefreshTokenSchema = new mongoose.Schema({
  token: { type: String },
  createdAt: { type: Date },
  expiresAt: { type: Date }
})

interface IUser {
  username: string;
  email: string;
  password?: string;
  provider?: "local" | "google" | "github" | "twitter";
  providerId?: string; // id from OAuth provider
  refreshTokens: IRefreshToken[];
  resetPasswordToken?: string,
  resetPasswordExpire?: Date,
  role?: string,
  trialStartDate?: Date;
  trialEndDate?: Date;
  hasUsedTrial?: boolean;
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true, lowercase: true },
  password: { type: String, trim: true },
  provider: { type: String, enum: ["local", "google", "github", "twitter"], default: "local" },
  providerId: { type: String },
  refreshTokens: [RefreshTokenSchema],
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  role: { type: String, default: "user", trim: true, enum: ["user", "admin"], lowercase: true },
  trialStartDate: { type: Date },
  trialEndDate: { type: Date },
  hasUsedTrial: { type: Boolean },
}, { timestamps: true });

const User = mongoose.model<IUser>("User", userSchema);

export default User;