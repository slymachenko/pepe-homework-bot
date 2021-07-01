const mongoose = require("mongoose");

const daySchema = new mongoose.Schema({
  dayIndex: { type: Number, required: [true, "Please provide a day number"] }, // 0-Mon 1-Tue etc.
  id: [Number], // user id of class members
  subjects: [
    {
      subject: {
        type: String,
        unique: true,
        required: [true, "Please provide a subject name"],
      },
      group: String,
      text: String,
      photo: String,
    },
  ],
});

module.exports = mongoose.model("Weekday", daySchema, "homework");
