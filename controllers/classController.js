const Class = require("../models/classModel");
const Homework = require("../models/homeworkModel");

exports.createClass = async (obj) => {
  try {
    const classDoc = await Class.create(obj);

    await Homework.create({ classID: classDoc._id });
    return classDoc;
  } catch (err) {
    console.error(err);
  }
};

exports.deleteClass = async (userID) => {
  try {
    const classDoc = await Class.findOne({ users: { $in: [userID] } });

    if (!classDoc) return false;

    await Class.deleteOne({ users: { $in: [userID] } });
    await Homework.deleteOne({ classID: classDoc._id });

    return classDoc;
  } catch (err) {
    console.error(err);
  }
};

exports.joinClass = async (classID, classPass, userID) => {
  try {
    const classDoc = await Class.findOne({ _id: classID, password: classPass });

    if (!classDoc) return false;

    classDoc.users.push(userID);
    await classDoc.save();

    return classDoc;
  } catch (err) {
    console.error(err);
  }
};

exports.leaveClass = async (userID) => {
  try {
    const classDoc = await Class.findOne({ users: { $in: [userID] } });

    if (!classDoc) return false;

    const index = classDoc.users.indexOf(userID);
    if (index !== -1) classDoc.users.splice(index, 1);
    await classDoc.save();

    return classDoc;
  } catch (err) {
    console.error(err);
  }
};

exports.findClass = async (userID) => {
  try {
    const classDoc = await Class.findOne({ users: { $in: [userID] } });

    if (!classDoc) return false;

    return classDoc;
  } catch (err) {
    console.error(err);
  }
};
