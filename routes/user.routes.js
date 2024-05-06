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
