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

    //To get how much unread messages user have

    const filteredConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const count =
          (await Message.countDocuments({
            conversationId: conversation._id,
            unreadParticipants: { $in: [userId] },
          }).exec()) || 0;

        return {
          _id: conversation._id,
          participants: conversation.participants.filter(
            (participant) => participant._id.toString() !== userId.toString()
          ),
          count,
        };
      })
    );

    if (filteredConversations.length === 0) {
      return res.status(404).json({ message: "User has no conversation" });
    }
    res.status(200).json(filteredConversations);
  } catch (error) {
    next(error);
  }
});

//This route is for counting unread messages
router.get("/unread-conversations/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Count documents where userId exists in unreadParticipants array
    const count = await Conversation.countDocuments({
      unreadParticipants: { $in: [userId] },
    }).exec();

    res.status(200).json(count);
  } catch (error) {
    console.error("Error in /unread-conversations route:", error);
    next(error);
  }
});

//This route is for removing user from unread messages
router.put(
  "/unread-conversations/:conversationId/:userId",
  async (req, res, next) => {
    const { conversationId, userId } = req.params;

    try {
      // Find the conversation document by conversationId
      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const initialConversationLength = conversation.unreadParticipants.length;

      // Remove userId from unreadParticipants array
      conversation.unreadParticipants = conversation.unreadParticipants.filter(
        (participant) => participant.toString() !== userId
      );

      // Save the updated conversation document
      await conversation.save();

      const isUserRemovedFromUnreadConversation =
        conversation.unreadParticipants.length < initialConversationLength;

      const messages = await Message.find({ conversationId });

      // Update the unreadParticipants array in each message
      messages.forEach(async (message) => {
        message.unreadParticipants = message.unreadParticipants.filter(
          (participant) => participant.toString() !== userId
        );
        await message.save();
      });

      // Send a success response
      if (isUserRemovedFromUnreadConversation) {
        return res.status(200).json({
          hadUnreadMessages: true,
          message: "User removed from unread messages",
        });
      }

      res.status(200).json({
        hadUnreadMessages: false,
        message: "User removed from unread messages",
      });
    } catch (error) {
      next(error);
    }
  }
);

// A route to get all messages of a certain converstaion
router.get("/messages/:conversationId", (req, res, next) => {
  const { conversationId } = req.params;
  Message.find({ conversationId })
    .populate("sender")
    .then((messages) => {
      res.status(200).json(messages);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
