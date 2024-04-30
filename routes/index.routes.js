// Module Imports
const router = require('express').Router();

// Routes import
const eventRoutes = require("./event.routes");

router.get('/', (req, res) => {
  res.json('All good in here')
});

router.use("/events", eventRoutes);

module.exports = router
