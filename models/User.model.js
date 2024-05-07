const { Schema, model, Types } = require("mongoose");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, "First name is required."],
    },
    lastName: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true, // Email should be unique
      required: [true, "Email is required."],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required."],
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
        message: "Birth date should be in the past.",
      },
    },
    phoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          // Check if the phone number contains at least 10 digits
          return /^[\d\s+]{10,}$/.test(value);
        },
        message: `Phone number should contain at least 10 digits.`,
      },
    },
    gender: {
      type: String,
      enum: ["Female", "Male"],
    },
    nationality: String,
    photo: String,
    bio: {
      type: String,
      trim: true,
    },
    skills: [
      {
        skillName: {
          type: String,
          trim: true,
          required: true,
        },
        proficiency: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced"],
          required: true,
        },
        ratingScore: {
          type: Number,
          min: 0,
          max: 5,
          default: 0,
        },
        ratingCount: {
          type: Number,
          default: 0,
        },
        _id: false,
      },
    ],
    categories: [String],

    events: [{ type: Types.ObjectId, ref: "Event", required: true }],

    education: [
      {
        degreeName: { type: String, trim: true, required: true },
        date: { type: Date, trim: true, required: true },
      },
    ],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

userSchema.pre("save", function (next) {
  if (this.isModified("firstName") || this.isModified("lastName")) {
    // If firstName or lastName is modified, update fullName
    this.fullName = `${this.firstName || ""} ${this.lastName || ""}`.trim();
  }
  next();
});

// Post-update hook to update fullName based on firstName and lastName after update
userSchema.post("findOneAndUpdate", async function (result) {
  try {
    console.log("Post-update hook triggered");

    const { _id } = result;

    // Fetch the updated document to get current firstName and lastName
    const updatedDocument = await this.model.findById(_id);

    if (updatedDocument) {
      const { firstName, lastName, fullName } = updatedDocument;

      // Check if fullName is already correctly set
      const updatedFullName = `${firstName} ${lastName}`.trim();
      if (fullName !== updatedFullName) {
        // Update the fullName field in the document
        await this.model.findOneAndUpdate(
          { _id: _id },
          { $set: { fullName: updatedFullName } }
        );
        console.log("fullName updated successfully");
      } else {
        console.log("fullName is already correctly set");
      }
    } else {
      console.log("Error: Updated document not found");
    }
  } catch (error) {
    console.error("Error in post-update hook:", error);
  }
});

const User = model("User", userSchema);

module.exports = User;
