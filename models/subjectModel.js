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

exports.MondaySubj = mongoose.model("Subject", subjSchema, "Monday");
exports.TuesdaySubj = mongoose.model("Subject", subjSchema, "Tuesday");
exports.WednesdaySubj = mongoose.model("Subject", subjSchema, "Wednesday");
exports.ThursdaySubj = mongoose.model("Subject", subjSchema, "Thursday");
exports.FridaySubj = mongoose.model("Subject", subjSchema, "Friday");
