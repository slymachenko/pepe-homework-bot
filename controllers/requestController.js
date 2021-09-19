const Class = require("../models/classModel");

exports.updateRequest = async (userID, req) => {
  try {
    // retrieving class document with userID in
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false; // if there's no class with user in return false

    // adding request to the user object
    classDoc.users.forEach((el) => {
      if (el.userID === userID) return (el.request = req);
    });

    await classDoc.save();

    return true;
  } catch (err) {
    console.error(err);
  }
};

exports.clearRequest = async (userID) => {
  try {
    // retrieving class document with userID in
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false; // if there's no class with user in return false

    // clearing request in the user object
    classDoc.users.forEach((el) => {
      if (el.userID === userID) return (el.request = "");
    });

    await classDoc.save();

    return true;
  } catch (err) {
    console.error(err);
  }
};

exports.checkRequest = async (userID) => {
  try {
    // retrieving class document with userID in
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false; // if there's no class with user in return false

    let request;

    classDoc.users.forEach((el) => {
      if (el.userID === userID) request = el.request;
    });

    if (request === "") return false;

    return request;
  } catch (err) {
    console.error(err);
  }
};
