const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  userID: {
    type: Number,
    required: [true, "Please provide user ID"],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  username: {
    type: String,
    required: [true, "Please provide username"],
  },
  request: {
    type: [String],
    default: [],
  },
});

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide Class Name!"],
  },
  users: {
    type: [usersSchema],
    default: new Array(),
  },
});

module.exports = mongoose.model("Class", classSchema, "classes");
