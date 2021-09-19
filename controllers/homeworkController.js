const Class = require("../models/classModel");
const Homework = require("../models/homeworkModel");

// returns homework document if succeed. If not returns false
exports.createSubject = async (userID, subject) => {
  try {
    // retrieving class document with userID in
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false;
    const homeworkDoc = await Homework.findOne({ classID: classDoc._id });

    let isIndexUnique = true;

    homeworkDoc.days[subject.day].forEach((el) => {
      if (el.subjectIndex == subject.index) isIndexUnique = false;
    });

    console.log(homeworkDoc.days[subject.day]);
    if (!isIndexUnique) return false;

    homeworkDoc.days[subject.day].push({
      subject: subject.name,
      subjectIndex: subject.index,
    });

    homeworkDoc.days[subject.day].sort((a, b) => {
      if (a.subjectIndex > b.subjectIndex) return 1;
      if (a.subjectIndex < b.subjectIndex) return -1;
      return 0;
    });

    homeworkDoc.save();

    return homeworkDoc;
  } catch (err) {
    console.error(err);
  }
};

// returns homework document if succeed. If not returns false
exports.deleteSubject = async (userID, subject) => {
  try {
    // retrieving class document with userID in
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false;
    const homeworkDoc = await Homework.findOne({ classID: classDoc._id });

    let subjectIndex = false;

    homeworkDoc.days[subject.day].forEach((el, i) => {
      if (el.subject === subject.name && el.subjectIndex == subject.index)
        subjectIndex = i;
    });

    if (subjectIndex === false) return false;

    homeworkDoc.days[subject.day].splice(subjectIndex, 1);

    homeworkDoc.save();
    return homeworkDoc;
  } catch (err) {
    console.error(err);
  }
};
