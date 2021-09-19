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

// returns class document if user successfully added. If not returns false
exports.addUsertoClass = async (userID, inviteUserID) => {
  try {
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false;

    // adding to users array object that contains userID
    classDoc.users.push({ userID: inviteUserID, isAdmin: false, request: "" });

    await classDoc.save();

    return classDoc;
  } catch (err) {
    console.error(err);
  }
};

// returns class document if user successfully promoted. If not returns false
exports.promoteUser = async (userID, promoteUserID) => {
  try {
    const classDoc = await Class.findOne({
      "users.userID": {
        $all: [userID, promoteUserID],
      },
    });
    if (!classDoc) return false;

    // setting isAdmin of the user object to true
    classDoc.users.forEach((el) => {
      if (el.userID == promoteUserID) return (el.isAdmin = true);
    });

    await classDoc.save();

    return classDoc;
  } catch (err) {
    console.error(err);
  }
};

// returns true if findes class document with userID
exports.checkUserinClass = async (userID) => {
  try {
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false;

    return true;
  } catch (err) {
    console.error(err);
  }
};

// returns true if object with userID has isAdmin = true. If not returns false
exports.checkUserAdmin = async (userID) => {
  try {
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    let isAdmin = false;

    classDoc.users.forEach((el) => {
      if (el.userID === userID && el.isAdmin === true) return (isAdmin = true);
      // if (el.userID === userID && el.isAdmin === true) return true;
    });

    return isAdmin;
    // return false;
  } catch (err) {
    console.error(err);
  }
};
