const { Schema, model, Types } = require("mongoose");

const categorySchema = new Schema(
  {
    categoryName: { type: String, unique: true },
    skills: [{ type: Types.ObjectId, ref: "Skill", required: true }],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Category = model("Category", categorySchema);

module.exports = Category;
