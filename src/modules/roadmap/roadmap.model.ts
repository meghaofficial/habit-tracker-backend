import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    build: {
      type: String,
      enum: ["manual", "ai"],
      default: "manual",
    },
    name: {
      type: String,
      required: [true, "Roadmap name is required"],
      trim: true,
      minlength: [0, "Name cannot be empty"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [150, "Description cannot exceed 150 characters"],
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
    expected_completion_time: {
      value: {
        type: Number,
        min: [0, "Duration cannot be negative"],
        default: null,
      },
      unit: {
        type: String,
        enum: ["days", "weeks", "months", "years"],
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Roadmap = mongoose.model("Roadmap", roadmapSchema);

export default Roadmap;
