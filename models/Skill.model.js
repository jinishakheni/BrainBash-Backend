const { Schema, model, Types } = require("mongoose");

const skillSchema = new Schema(
  {
    skillName: { type: String, required: true, unique: true },
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

const Skill = model("Skill", skillSchema);

module.exports = Skill;
