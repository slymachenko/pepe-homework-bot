const Class = require("../models/classModel");
const Homework = require("../models/homeworkModel");

// returns homework document
exports.createSubject = async (userID, subject) => {
  try {
    // retrieving class document with userID in
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false;
    const HomeworkDoc = await Homework.findOne({ classID: classDoc._id });

    HomeworkDoc.days[subject.day].push({
      subject: subject.name,
      subjectIndex: subject.index,
    });

    HomeworkDoc.days[subject.day].sort((a, b) => {
      if (a.subjectIndex > b.subjectIndex) return 1;
      if (a.subjectIndex < b.subjectIndex) return -1;
      return 0;
    });

    HomeworkDoc.save();

    return HomeworkDoc;
  } catch (err) {
    console.error(err);
  }
};
