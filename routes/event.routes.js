//Module Imports
const router = require("express").Router();

//MidlleWare Imports
const { isAuthenticated } = require("../middlewares/route-gaurd.middleware");

//Model
const Event = require("../models/Event.model");

// Fetch events route
router.get("/", async (req, res, next) => {
  const hostProjection = { _id: 0, firstName: 1, lastName: 1 };
  if (req.query.title) {
    req.query.title = { $regex: req.query.title, $options: 'i' }
  }
  if (req.query.skills) {
    req.query.skills = { $in: [req.query.skills] }
  }
  try {
    const events = await Event.find(req.query).populate({ path: "hostId", select: hostProjection });
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }

});

// Fetch event by eventId route
router.get("/:eventId", async (req, res, next) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId).populate("hostId");
    event ? res.status(200).json(event) : res.status(404).json({ message: "The requested event was not found" });
  } catch (error) {
    next(error);
  }

});


// Register middleware for only post, put and delete event route
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

// Update event route
router.put("/:eventId", async (req, res, next) => {
  const { eventId } = req.params;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, { new: true, runValidators: true });
    updatedEvent ? res.status(200).json(updatedEvent) : res.status(404).json({ message: "The requested event was not found" });
  } catch (error) {
    next(error);
  }

});

// Delete event route
router.delete("/:eventId", async (req, res, next) => {
  const { eventId } = req.params;

  try {
    const deletedEvent = await Event.findByIdAndDelete(eventId);
    deletedEvent ? res.status(204).send() : res.status(404).json({ message: "The requested event was not found" });;
  } catch (error) {
    next(error);
  }

});

module.exports = router;