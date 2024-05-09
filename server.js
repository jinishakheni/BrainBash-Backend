const app = require("./app");
const withDB = require("./db");
const { Server } = require("socket.io");

// ℹ️ Sets the PORT for our app to have access to it. If no env has been set, we hard code it to 5005
const PORT = process.env.PORT || 5005;

//Import models
const MessageModel = require("./models/Message.model");
const Conversation = require("./models/Conversation.model");

// ℹ️ Connects to the database
withDB(() => {
  // ℹ️ If connection was successful, start listening for requests
  let myServer = app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });

  const FRONTEND_URL = process.env.ORIGIN || "http://localhost:5173";

  //-----------------SCOKET.IO SETUP-------------------------------
  const io = new Server(myServer, {
    cors: {
      origin: [FRONTEND_URL],
    },
  });

  io.on("connection", (socket) => {
    socket.on("disconnect", (reason) => {
      // the reason of the disconnection, for example "transport error"
      console.log("User disconnected reason" + reason);
    });

    socket.on("join_chat", (data) => {
      socket.join(data);
      console.log("User Joined Room: " + data);
    });

    socket.on("join_messages", (userId) => {
      socket.join(userId);
      console.log("User Joined his conversations in room: " + userId);
    });

    socket.on("send_message", async (data) => {
      const {
        content: { sender, message },
        chatId,
      } = data;
      let newMessage = {
        sender: sender,
        message: message,
        conversationId: chatId,
      };

      const getParticipantsExceptAndUpdateUnread = async (
        conversationId,
        excludedParticipantId
      ) => {
        try {
          // Find the conversation by ID and retrieve the participants array
          const conversation = await Conversation.findById(conversationId);

          if (!conversation) {
            throw new Error("Conversation not found");
          }

          // Filter out the excluded participant ID from the participants array
          const participantsExcludedSender = conversation.participants.filter(
            (participantId) =>
              participantId.toString() !== excludedParticipantId.toString()
          );

          // Update the unreadParticipants array in the Conversation model
          conversation.unreadParticipants = participantsExcludedSender;
          newMessage.unreadParticipants = participantsExcludedSender;
          await conversation.save();

          await MessageModel.create(newMessage).then(async (createdMessage) => {
            try {
              let populatedMessage = await MessageModel.populate(
                createdMessage,
                {
                  path: "sender",
                }
              );

              io.to(conversationId).emit("receive_message", populatedMessage);
            } catch (err) {
              // Handle error
              console.error(err);
            }
          });

          participantsExcludedSender.forEach(async (participantId) => {
            io
              .to(participantId.toString())
              .emit("unread_conversations2", conversationId);
              io
              .to(participantId.toString())
              .emit("unread_conversations", conversationId);
          });

          return participantsExcludedSender;
        } catch (error) {
          console.error(
            "Error retrieving participants and updating unreadParticipants:",
            error
          );
          throw error;
        }
      };

      await getParticipantsExceptAndUpdateUnread(chatId, sender);
    });
  });
});
