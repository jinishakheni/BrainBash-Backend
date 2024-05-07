//Module imports
const router = require("express").Router();

//MidlleWare Imports
const { isAuthenticated } = require("../middlewares/route-gaurd.middleware");

//Models
const User = require("../models/User.model");

//Routes
router.get("/", async (req, res, next) => {
  req.query["skills.0"] = { $exists: true };
  if (req.query.fullName) {
    req.query.fullName = { $regex: req.query.fullName, $options: 'i' }
  }
  if (req.query.categories) {
    req.query.categories = { $in: [req.query.categories] }
  }
  if (req.query.skills) {
    req.query["skills.name"] = req.query.skills;
    delete req.query.skills;
  }
  try {
    const users = await User.find(req.query).select({
      fullName: 1,
      categories: 1,
      photo: 1,
      _id: 1,
    });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (user) {
      return res.status(200).json(user);
    }
    res.status(404).json({ message: "User not found" });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", isAuthenticated, async (req, res, next) => {
  const { id } = req.params;
  const { passwordHash, ...restOfFields } = req.body;

  try {
    if (passwordHash) {
      return res
        .status(400)
        .json({ message: "Cannot update password directly." });
    }

    if (id.toString() !== req.payload.userId.toString()) {
      return res.status(400).json({
        message: "You're not authorized to change another user's data",
      });
    }
    const updatedUser = await User.findByIdAndUpdate(id, restOfFields, {
      new: true,
      runValidators: true,
    });
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.put("/skill/:userId", async (req, res, next) => {
  const { userId } = req.params;
  const { opration } = req.body;
  const searchQuery = { _id: userId };
  let updateData = {};
  if (opration === "add") {
    updateData = {
      $push: {
        skills: {
          proficiency: req.body.proficiency,
          skillName: req.body.skillName,
        },
      },
      $addToSet: { categories: req.body.category }
    }
  } else if (opration === "update") {
    searchQuery['skills.skillName'] = req.body.skillName;
    if (req.body.proficiency) {
      updateData = {
        $set: {
          'skills.$.proficiency': req.body.proficiency,
        },
      }
    } else if (req.body.ratingScore) {
      updateData = {
        $set: {
          'skills.$.ratingScore': req.body.ratingScore,
          'skills.$.ratingCount': req.body.ratingCount,
        },
      }
    }
  } else if (opration === "delete") {
    updateData = {
      $pull: {
        skills: { skillName: req.body.skillName },
        categories: req.body.category
      },
    }
  }
  try {
    // Check new skill is already exist for user or not
    if (opration === "add") {
      const user = await User.findById(userId);
      const existingSkillNames = user.skills.map((skill) => skill.skillName);
      if (existingSkillNames.indexOf(req.body.skillName) >= 0) {
        return res.status(404).json({ message: "Skill already added" })
      }
    }
    const updatedUser = await User.findOneAndUpdate(
      searchQuery,
      updateData, { new: true }
    );
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    next(error);
  }
})

router.delete("/:id", isAuthenticated, async (req, res, next) => {
  const { id } = req.params;
  try {
    if (id.toString() !== req.payload.userId.toString()) {
      return res.status(400).json({
        message: "You're not authorized to change another user's data",
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (user) {
      res.sendStatus(204);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
