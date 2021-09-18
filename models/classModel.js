const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide Class Name!"],
  },
  password: {
    type: String,
    required: [true, "Please provide Class Password!"],
  },
  users: {
    type: [Number],
    default: new Array(),
  },
});

module.exports = mongoose.model("Class", classSchema, "classes");
