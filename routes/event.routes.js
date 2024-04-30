//Module Imports
const router = require("express").Router();

//MidlleWare Imports
const { isAuthenticated } = require("../middlewares/route-gaurd.middleware");

//Model
const Event = require("../models/Event.model");

// Register middleware
router.use(isAuthenticated);

// Add event route
router.post("/", async (req, res, next) => {

  try {
    const newEvent = await Event.create(req.body);
    res.status(201).json(newEvent);
  } catch (error) {
    next(error);
  }

});

// Fetch events route
router.get("/", async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const events = await Event.find({ startingTime: { $gt: today } });
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }

});

// Fetch event by eventId route
router.get("/:eventId", async (req, res, next) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }

});

// Update event route
router.put("/:eventId", async (req, res, next) => {
  const { eventId } = req.params;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, { new: true, runValidators: true });
    res.status(200).json(updatedEvent);
  } catch (error) {
    next(error);
  }

});

// Delete event route
router.delete("/:eventId", async (req, res, next) => {
  const { eventId } = req.params;

  try {
    await Event.findByIdAndDelete(eventId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }

});

module.exports = router;