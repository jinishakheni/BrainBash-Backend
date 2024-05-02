//Module imports
const router = require("express").Router();

//MidlleWare Imports
const { isAuthenticated } = require("../middlewares/route-gaurd.middleware");

//Model
const Category = require("../models/Category.model");

//Routes
router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find(req.query).populate(
      "skills"
    );
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id).populate("skills");
    if (category) {
      return res.status(200).json(category);
    }
    res.status(404).json({ message: "Category not found" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
