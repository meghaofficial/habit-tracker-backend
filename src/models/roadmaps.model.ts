import mongoose from "mongoose";
import { RoadmapItem } from "../types";

const roadmapSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    total_nodes_count: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    completed_nodes_count: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["completed", "in-progress", "pending"],
      default: "pending",
      required: true,
    },
    accent_color: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
    nodes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Roadmap",
      },
    ],
    type: {
      type: String,
      enum: ["roadmap", "list"],
      default: "roadmap",
      required: true,
    },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      default: null,
    },
    points: [
      {
        id: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
        order: {
          type: Number,
          required: true,
          min: 0,
        },
        completed: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const RoadmapItem = mongoose.model<RoadmapItem>("Roadmap", roadmapSchema);

export default RoadmapItem;
