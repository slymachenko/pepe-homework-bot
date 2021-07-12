const Weekday = require("../models/dayModel");

exports.createDay = async (obj) => {
  return await Weekday.create(obj);
};

exports.findDay = async (dayIndex) => {
  return await Weekday.findOne({ dayIndex });
};

exports.editDay = async (dayIndex, obj) => {
  return await Weekday.findOneAndUpdate({ dayIndex }, obj, {
    new: true,
  });
};

exports.deleteDay = async (dayIndex) => {
  return await Weekday.deleteOne({ dayIndex });
};

exports.findAllDays = async () => {
  return await Weekday.find({});
};
