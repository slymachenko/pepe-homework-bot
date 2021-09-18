const Class = require("../models/classModel");
const Homework = require("../models/homeworkModel");

exports.addSubject = async (userID, obj, dayIndex, subjectIndex) => {
  try {
    const classDoc = await Class.findOne({ users: { $in: [userID] } });
    const homeworkDoc = await Homework.findOne({ classID: classDoc._id });

    if (![1, 2, 3, 4, 5, 6, 7].includes(dayIndex)) return false;
    if (
      ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].includes(
        subjectIndex
      )
    )
      return false;

    if (!homeworkDoc) return false;
    if (!homeworkDoc.days[dayIndex])
      homeworkDoc.days[dayIndex] = { subjects: [] };

    homeworkDoc.days[dayIndex].subjects[subjectIndex] = obj;
    homeworkDoc.save();

    return homeworkDoc;
  } catch (err) {
    console.error(err);
  }
};
