// Module Imports
const router = require('express').Router();

router.get('/', (req, res) => {
  res.json('All good in here')
});

// Event routes import
const eventRoutes = require("./event.routes");
router.use("/events", eventRoutes);

module.exports = router
