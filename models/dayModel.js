const mongoose = require("mongoose");

const daySchema = new mongoose.Schema({
  day: Number, // 0-Mon 1-Tue etc.
  id: [Number], // user id of class members
  subjects: [
    {
      subject: String,
      group: String,
      text: String,
      photo: String,
    },
  ],
});

let weekday = mongoose.model("Weekday", daySchema, "homework");
