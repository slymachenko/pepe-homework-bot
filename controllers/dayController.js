const Weekday = require("../models/dayModel");

exports.createDay = async (obj) => {
  try {
    return await Weekday.create(obj);
  } catch (err) {
    console.error(err);
  }
};

exports.findDay = async (dayIndex) => {
  try {
    return await Weekday.findOne({ dayIndex });
  } catch (err) {
    console.error(err);
  }
};

exports.editDay = async (dayIndex, obj) => {
  try {
    return await Weekday.findOneAndUpdate({ dayIndex }, obj, {
      new: true,
    });
  } catch (err) {
    console.error(err);
  }
};

exports.deleteDay = async (dayIndex) => {
  try {
    return await Weekday.deleteOne({ dayIndex });
  } catch (err) {
    console.error(err);
  }
};

exports.findAllDays = async () => {
  try {
    return await Weekday.find({});
  } catch (err) {
    console.error(err);
  }
};
