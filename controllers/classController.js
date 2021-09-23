const Class = require("../models/classModel");
const Homework = require("../models/homeworkModel");

// returns class document
exports.createClass = async (obj) => {
  try {
    const classDoc = await Class.create(obj);

    await Homework.create({ classID: classDoc._id });
    return classDoc;
  } catch (err) {
    console.error(err);
  }
};

// returns class document if completed successfully. if not returns false
exports.deleteClass = async (userID) => {
  try {
    // retrieving class document with userID in
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false;

    await Class.deleteOne({ users: { $elemMatch: { userID } } });
    await Homework.deleteOne({ classID: classDoc._id });

    return classDoc;
  } catch (err) {
    console.error(err);
  }
};

// returns class document if completed successfully. if not returns false
exports.leaveClass = async (userID) => {
  try {
    // retrieving class document with userID in
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false;

    // deleting object that contains userID from the users array
    classDoc.users.forEach((el, i) => {
      if (el.userID === userID) classDoc.users.splice(i, 1);
    });

    await classDoc.save();

    return classDoc;
  } catch (err) {
    console.error(err);
  }
};

// returns class document. If not found returns false
exports.findClass = async (userID) => {
  try {
    // retrieving class document with userID in
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false; // if there's no class with user in return false

    return classDoc;
  } catch (err) {
    console.error(err);
  }
};

exports.checkClasshasSingleAdmin = async (userID) => {
  try {
    // retrieving class document with userID in
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false; // if there's no class with user in return false
    let adminsCount = 0;

    // checking if class has only one member
    if (classDoc.users.length === 1) return false;

    classDoc.users.forEach((el) => {
      if (el.isAdmin) adminsCount++;
    });

    if (adminsCount === 1) return false;
    return true;
  } catch (err) {
    console.error(err);
  }
};
