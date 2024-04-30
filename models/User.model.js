const { Schema, model, Types } = require('mongoose');

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, 'First name is required.'],
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,   // Email should be unique
      required: [true, 'Email is required.'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required.'],
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value) {
          // Check if the date of birth is in the past
          const currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0);
          return value < currentDate;
        },
        message: "Birth date should be in the past."
      }
    },
    phoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          // Check if the phone number contains at least 10 digits
          return /^[\d\s+]{10,}$/.test(value);
        },
        message: `Phone number should contain at least 10 digits.`
      }
    },
    gender: {
      type: String,
      enum: ["Female", "Male"]
    },
    photo: String,
    bio: {
      type: String,
      trim: true
    },
    skills: {
      type: [{
        name: {
          type: String,
          trim: true,
        },
        proficiency: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced'],
        },
        ratingScore: {
          type: Number,
          min: 0,
          max: 5,
          default: 0
        },
        ratingCount: {
          type: Number,
          default: 0
        }
      }]
    },
    events: {
      type: [Types.ObjectId],
      ref: "Event"
    },
    education: {
      type: String,
      trim: true,
    },
    certification: {
      type: String,
      trim: true,
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
)

const User = model('User', userSchema);

module.exports = User;
