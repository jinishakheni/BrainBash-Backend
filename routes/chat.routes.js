const router = require("express").Router();
const Conversation = require("../models/Conversation.model");
const Message = require("../models/Message.model");

// A route to return the converstaion id between two participants if it already exists
// or create a new converstaion, when users chat for the first time
router.post("/conversation", (req, res, next) => {
  //The user will send an array of participant ids in the chat (usually just two)
  // eg. participants = ['609b63324f3c1632c8ff35f4', '609b63644f3c1632c8ff35f5']
  const { participants } = req.body;
  Conversation.findOne({ participants: { $all: participants } })
    .then((found) => {
      if (found) {
        //Conversation between those participants already present
        res.status(200).json(found);
      } else {
        //Create a conversation between them if not present
        Conversation.create({ participants }).then((response) => {
          res.status(200).json(response);
        });
      }
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/conversations/:userId", async (req, res, next) => {
  const { userId } = req.params;
  try {
    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    }).populate({
      path: "participants",
      select: "fullName photo _id", // Select the fields you want to include in the projection
    });

    const filteredConversations = conversations.map(conversation => ({
        _id: conversation._id, 
        participants: conversation.participants.filter(participant => participant._id.toString() !== userId.toString())
      }));

    if (filteredConversations.length === 0) {
      return res.status(404).json({ message: "User has no conversation" });
    }
    res.status(200).json(filteredConversations);
  } catch (error) {
    next(error);
  }
});

// A route to get all messages of a certain converstaion
router.get("/messages/:conversationId", (req, res, next) => {
  const { conversationId } = req.params;
  Message.find({ conversationId }).populate("sender")
    .then((messages) => {
      res.status(200).json(messages);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
