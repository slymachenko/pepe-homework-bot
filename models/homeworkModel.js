const mongoose = require("mongoose");

const daySchema = new mongoose.Schema({
  subjects: [
    {
      subject: {
        type: String,
        required: [true, "Please provide a subject name"],
      },
      text: String,
      photo: String,
    },
  ],
});

const homeworkSchema = new mongoose.Schema({
  classID: {
    type: String,
    required: [true, "Please provide Class ID"],
  },
  days: {
    type: [daySchema],
    default: new Array(),
  },
});

module.exports = mongoose.model("Homework", homeworkSchema, "homework");
