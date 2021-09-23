const Class = require("../models/classModel");

// returns class document if user successfully entered. If not returns false
exports.addUsertoClass = async (URL, userID) => {
  try {
    const classDoc = await Class.findById(URL);
    if (!classDoc) return false;

    classDoc.users.forEach((el) => {
      if (el.userID == userID) return false;
    });

    classDoc.users.push({
      isAdmin: false,
      request: [],
      userID,
    });
    classDoc.save();

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
