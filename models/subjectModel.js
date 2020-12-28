const mongoose = require("mongoose");

const subjSchema = new mongoose.Schema({
  subject: String,
  text: String,
  photo: String,
  groups: [
    {
      teacher: String,
      text: String,
      photo: String,
    },
    {
      teacher: String,
      text: String,
      photo: String,
    },
    {
      teacher: String,
      text: String,
      photo: String,
    },
  ],
});

// Creating homework object with data taken from the database
let MondaySubj = mongoose.model("Subject", subjSchema, "Monday"),
  TuesdaySubj = mongoose.model("Subject", subjSchema, "Tuesday"),
  WednesdaySubj = mongoose.model("Subject", subjSchema, "Wednesday"),
  ThursdaySubj = mongoose.model("Subject", subjSchema, "Thursday"),
  FridaySubj = mongoose.model("Subject", subjSchema, "Friday");

// Exporting homework models for updating homework
module.exports = {
  MondaySubj,
  TuesdaySubj,
  WednesdaySubj,
  ThursdaySubj,
  FridaySubj,
};
