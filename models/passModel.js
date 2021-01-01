const mongoose = require("mongoose");

const passSchema = new mongoose.Schema({
  loggedUsers: [Number],
});

module.exports = mongoose.model("LoggedUsers", passSchema, "LoggedUsers");
