const { Schema, model, Types } = require("mongoose");

const eventSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Title is required."],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Description is required."],
    },
    startingTime: {
      type: Date,
      required: [true, "Starting time is required."],
    },
    duration: {
      type: String,
      trim: true,
      required: [true, "Duration is required."],
    },
    skills: [String],
    categories: [String],
    mode: {
      type: String,
      enum: ["Online", "Offline"],
      required: true,
    },
    address: {
      type: String,
      required: [true, "Meeting link is required."],
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "https://cdn-icons-png.flaticon.com/512/2558/2558944.png",
    },
    hostId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendees: [{ type: Types.ObjectId, ref: "User"}],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Event = model("Event", eventSchema);

module.exports = Event;
