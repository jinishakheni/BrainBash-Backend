const { Schema, model, Types } = require('mongoose');

const eventSchema = new Schema(
  {
    senderId: {
      type: Types.ObjectId,
      required: [true, 'Sender id is required.']
    },
    receiverId: {
      type: Types.ObjectId,
      required: [true, 'Receiver id is required.']
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Title is required.']
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Description is required.']
    },
    skill: {
      type: String,
      trim: true,
      required: [true, 'Skill is required.']
    },
    preferredTime: {
      type: [{
        startDate: {
          type: Date,
          required: true
        },
        endDate: {
          type: Date,
          required: true,
          validate: {
            validator: function (value) {
              // Access the document using `this` and compare the end date with the start date
              return this.startDate <= value;
            },
            message: `End date should be greater than start date.`
          }
        },
        startTime: {
          type: Date,
          required: true
        },
        duration: {
          type: String,
          trim: true
        }
      }],
      required: [true, "Preffered time is required"],
    },
    scheduledTime: {
      type: [{
        startDate: {
          type: Date,
          required: true
        },
        endDate: {
          type: Date,
          required: true,
          validate: {
            validator: function (value) {
              // Access the document using `this` and compare the end date with the start date
              return this.startDate <= value;
            },
            message: `End date should be greater than start date.`
          }
        },
        startTime: {
          type: Date,
          required: true
        },
        duration: {
          type: String,
          trim: true
        }
      }]
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Closed"],
      default: "Pending"
    },
    responseMessage: {
      type: String,
      trim: true
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
)

const Event = model('Event', eventSchema);

module.exports = Event;
