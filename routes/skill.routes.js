//Module imports
const router = require("express").Router();

//MidlleWare Imports
const { isAuthenticated } = require("../middlewares/route-gaurd.middleware");

//Model
const Skill = require("../models/Skill.model");

//Routes
router.get("/", async (req, res, next) => {
  try {
    const skills = await Skill.find(req.query);
    res.status(200).json(skills);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const skill = await Skill.findById(id);
    if (skill) {
      return res.status(200).json(skill);
    }
    res.status(404).json({ message: "Skill not found" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
