const mongoose = require("mongoose");

const petitionSchema = new mongoose.Schema(
{
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },

  status: {
    type: String,
    enum: ["pending", "active", "under_review", "closed", "rejected"],
    default: "pending",
  },

  goal: {
    type: Number,
    default: 100,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  signatures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  /* OFFICIAL RESPONSES */

  responses: [
    {
      officialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
},
{ timestamps: true }
);

module.exports = mongoose.model("Petition", petitionSchema);