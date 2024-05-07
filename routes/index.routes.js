// Module Imports
const router = require("express").Router();

router.get("/", (req, res) => {
  res.json("All good in here");
});

// Event routes import
const eventRoutes = require("./event.routes");
router.use("/events", eventRoutes);

//User routes
const userRoutes = require("./user.routes");
router.use("/users", userRoutes);

//Category routes
const categoryRoutes = require("./category.routes");
router.use("/categories", categoryRoutes);

//Skill routes
const skillRoutes = require("./skill.routes");
router.use("/skills", skillRoutes);

//Chat Routes
const chatRoutes = require('./chat.routes');
router.use('', chatRoutes);

module.exports = router;
