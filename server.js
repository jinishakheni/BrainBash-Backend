const app = require("./app");
const withDB = require("./db");
const { Server } = require("socket.io");

// ℹ️ Sets the PORT for our app to have access to it. If no env has been set, we hard code it to 5005
const PORT = process.env.PORT || 5005;

//Import models
const MessageModel = require("./models/Message.model");

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
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("join_chat", (data) => {
      socket.join(data);
      console.log("User Joined Room: " + data);
    });

    socket.on("send_message", (data) => {
      const {
        content: { sender, message },
        chatId,
      } = data;
      let newMessage = {
        sender: sender,
        message: message,
        conversationId: chatId,
      };
      // As the conversation happens, keep saving the messages in the DB
      MessageModel.create(newMessage).then(async (createdMessage) => {
        try {
          let populatedMessage = await MessageModel.populate(createdMessage, {
            path: "sender",
          });
          socket.to(data.chatId).emit("receive_message", populatedMessage);
        } catch (err) {
          // Handle error
          console.error(err);
        }
      });
    });
  });
});
