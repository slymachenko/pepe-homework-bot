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

let MondaySubj = mongoose.model("Subject", subjSchema, "Monday"),
  TuesdaySubj = mongoose.model("Subject", subjSchema, "Tuesday"),
  WednesdaySubj = mongoose.model("Subject", subjSchema, "Wednesday"),
  ThursdaySubj = mongoose.model("Subject", subjSchema, "Thursday"),
  FridaySubj = mongoose.model("Subject", subjSchema, "Friday");

module.exports = {
  MondaySubj,
  TuesdaySubj,
  WednesdaySubj,
  ThursdaySubj,
  FridaySubj,
};
