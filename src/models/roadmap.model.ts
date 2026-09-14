import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    thumbnail: {
      type: {
        type: String,
        enum: ["url", "upload"],
      },

      url: {
        type: String,
      },

      publicId: {
        type: String,
      },
    },

    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "active",
    },

    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },

    nodes: [
      {
        id: {
          type: String,
          required: true,
        },

        text: {
          type: String,
          required: true,
        },

        x: {
          type: Number,
          required: true,
        },

        y: {
          type: Number,
          required: true,
        },

        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],

    edges: [
      {
        id: {
          type: String,
          required: true,
        },

        source: {
          type: String,
          required: true,
        },

        target: {
          type: String,
          required: true,
        },

        type: {
          type: String,
          enum: ["child", "linked"],
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);