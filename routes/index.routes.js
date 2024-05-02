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

module.exports = router;
