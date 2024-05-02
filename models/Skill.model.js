const { Schema, model, Types } = require('mongoose');

const skillSchema = new Schema(
  {
    skill: String,
    categoryId: {
      type: Tapes.ObjectId,
      ref: "Category"
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
)

const Skill = model('Skill', skillSchema);

module.exports = Skill;
