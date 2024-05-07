const { Schema, model } = require("mongoose");

// 1. Define your schema
const ConversationSchema = new Schema({
  participants: [{
      ref: 'User',
      type: Schema.Types.ObjectId
    },
  ] 
})

// 2. Define your model
const Conversation = model('conversation', ConversationSchema)

// 3. Export your Model with 'module.exports'
module.exports = Conversation