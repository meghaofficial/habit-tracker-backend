import mongoose from "mongoose";

interface IPlan {
  name: string;
  price: number;
  duration: number;
  active: boolean;
}

const plansSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  price: { type: Number, default: 0 },
  duration: { type: Number, required: true },
  active: { type: Boolean, default: false }
}, { timestamps: true });

const Plan = mongoose.model<IPlan>("Plan", plansSchema);

export default Plan;