const mongoose = require("mongoose");

const daySchema = new mongoose.Schema({
  subjects: [
    {
      subjectIndex: {
        type: Number,
        required: [true, "Please provide a subject index"],
        min: [1, "Subject index must be a number in the range 1-10"],
        max: [10, "Subject index must be a number in the range 1-10"],
      },
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
