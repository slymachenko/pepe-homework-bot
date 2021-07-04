const mongoose = require("mongoose");

const daySchema = new mongoose.Schema({
  // 0-Mon 1-Tue etc.
  dayIndex: {
    type: Number,
    unique: true,
    required: [true, "Please provide a day number"],
  },
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

module.exports = mongoose.model("Weekday", daySchema, "homework");
