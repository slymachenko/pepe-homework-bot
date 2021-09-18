const Class = require("../models/classModel");
const Homework = require("../models/homeworkModel");

exports.createClass = async (obj) => {
  try {
    const { _id } = await Class.create(obj);
    await Homework.create({ classID: _id });
    return _id;
  } catch (err) {
    console.error(err);
  }
};

exports.findClass = async (dayIndex) => {
  try {
    return await Class.findOne({ dayIndex });
  } catch (err) {
    console.error(err);
  }
};

exports.editClass = async (dayIndex, obj) => {
  try {
    return await Class.findOneAndUpdate({ dayIndex }, obj, {
      new: true,
    });
  } catch (err) {
    console.error(err);
  }
};

exports.deleteClass = async (classID, classPass) => {
  try {
    const deletedClass = await Class.findOneAndDelete({
      _id: classID,
      password: classPass,
    });

    if (!deletedClass) return false;

    await Homework.deleteOne({ classID });
    return deletedClass.name;
  } catch (err) {
    console.error(err);
  }
};
