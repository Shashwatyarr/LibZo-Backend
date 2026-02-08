const mongoose = require("mongoose");

const ClubRequestSchema = new mongoose.Schema(
  {
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      defualt: "pending",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    actionBY: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    actionAt: Date,
  },
  { timestamps: true },
);

ClubRequestSchema.index({ clubId: 1, status: 1 });

module.export = mongoose.model("ClubRequest", ClubRequestSchema);
