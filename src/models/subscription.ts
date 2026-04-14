// import mongoose from "mongoose";

// interface ISubscription {
//   name: string;
//   price: number;
//   duration: number;
//   active: boolean;
// }

// const subsSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true, unique: true },
//   price: { type: Number, default: 0 },
//   duration: { type: Number, required: true },
//   active: { type: Boolean, default: false }
// }, { timestamps: true });

// const Subscription = mongoose.model<ISubscription>("plan", subsSchema);

// export default Subscription;