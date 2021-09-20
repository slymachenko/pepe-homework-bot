const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  subjectIndex: {
    type: Number,
    required: [true, "Please provide a subject index"],
    unique: true,
    min: [1, "Subject index must be a number in the range 1-10"],
    max: [10, "Subject index must be a number in the range 1-10"],
  },
  subject: {
    type: String,
    required: [true, "Please provide a subject name"],
  },
  text: {
    type: String,
    default: "",
  },
  photo: {
    type: String,
    default: "",
  },
});

const homeworkSchema = new mongoose.Schema({
  classID: {
    type: String,
    required: [true, "Please provide Class ID"],
  },
  days: {
    Monday: {
      type: [subjectSchema],
      default: new Array(),
    },
    Tuesday: {
      type: [subjectSchema],
      default: new Array(),
    },
    Wednesday: {
      type: [subjectSchema],
      default: new Array(),
    },
    Thursday: {
      type: [subjectSchema],
      default: new Array(),
    },
    Friday: {
      type: [subjectSchema],
      default: new Array(),
    },
  },
});

module.exports = mongoose.model("Homework", homeworkSchema, "homework");
