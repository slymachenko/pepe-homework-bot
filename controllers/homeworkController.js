const Class = require("../models/classModel");
const Homework = require("../models/homeworkModel");

const getDay = async (userID, day) => {
  try {
    // retrieving class document with userID in
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false;
    const homeworkDoc = await Homework.findOne({ classID: classDoc._id });

    return homeworkDoc.days[day];
  } catch (err) {
    console.error(err);
  }
};

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

exports.getSubjectsButtons = async (userID, day) => {
  try {
    const dayDoc = await getDay(userID, day);

    const subjectsArr = [[], [], [], []];

    dayDoc.forEach((el, i) => {
      //   if ([0, 4, 6, 9].includes(i)) subjectsArr.push([]);
      if (i <= 2) subjectsArr[0].push(`${el.subjectIndex}.${el.subject}`);
      if (i > 2 && i <= 5)
        subjectsArr[1].push(`${el.subjectIndex}.${el.subject}`);
      if (i > 5 && i <= 8)
        subjectsArr[2].push(`${el.subjectIndex}.${el.subject}`);
      if (i > 8) subjectsArr[3].push(`${el.subjectIndex}.${el.subject}`);
    });

    subjectsArr.push(["Back"]);

    return subjectsArr;
  } catch (err) {
    console.error(err);
  }
};

exports.checkDayhasSubjects = async (userID, day) => {
  const dayDoc = await getDay(userID, day);
  let isSubjectinDay = false;

  if (dayDoc.length > 0) isSubjectinDay = true;

  return isSubjectinDay;
};

exports.checkSubjectinDay = async (userID, day, subject) => {
  const dayDoc = await getDay(userID, day);
  let isSubjectinDay = false;

  dayDoc.forEach((el) => {
    if (el.subject === subject) isSubjectinDay = true;
  });

  return isSubjectinDay;
};

exports.addHomework = async (userID, day, subject, homework) => {
  try {
    // retrieving class document with userID in
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false;
    const homeworkDoc = await Homework.findOne({ classID: classDoc._id });
    const dayDoc = homeworkDoc.days[day];

    dayDoc.forEach((el) => {
      if (el.subject === subject) {
        el.text = homework.text || el.text;
        if (homework.photo) el.photo.push(homework.photo);
      }
    });

    homeworkDoc.save();
    return true;
  } catch (err) {
    console.error(err);
  }
};

exports.clearHomework = async (userID, day, subject) => {
  try {
    // retrieving class document with userID in
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false;
    const homeworkDoc = await Homework.findOne({ classID: classDoc._id });
    const dayDoc = homeworkDoc.days[day];

    dayDoc.forEach((el) => {
      if (el.subject === subject) {
        el.text = "";
        el.photo = "";
      }
    });

    homeworkDoc.save();
    return true;
  } catch (err) {
    console.error(err);
  }
};

exports.getAllHomework = async (userID) => {
  try {
    // retrieving class document with userID in
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false;
    const homeworkDoc = await Homework.findOne({ classID: classDoc._id });

    return homeworkDoc.days;
  } catch (err) {
    console.error(err);
  }
};

exports.getDayHomework = async (userID, day) => {
  try {
    // retrieving class document with userID in
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false;
    const homeworkDoc = await Homework.findOne({ classID: classDoc._id });

    return homeworkDoc.days[day];
  } catch (err) {
    console.error(err);
  }
};

exports.getSubjectHomework = async (userID, day, subjectIndex, subject) => {
  try {
    // retrieving class document with userID in
    const classDoc = await Class.findOne({ users: { $elemMatch: { userID } } });
    if (!classDoc) return false;
    const homeworkDoc = await Homework.findOne({ classID: classDoc._id });

    const subjIndex = homeworkDoc.days[day].findIndex((el) => {
      return el.subject === subject && el.subjectIndex == subjectIndex;
    });

    return homeworkDoc.days[day][subjIndex];
  } catch (err) {
    console.error(err);
  }
};

exports.getMediaPhotoGroup = (photos, caption) => {
  let media = [];

  photos.forEach((el, i) => {
    if (i === 1)
      media.push({ type: "photo", media: el, caption, parse_mode: "HTML" });
    if (i !== 1) media.push({ type: "photo", media: el });
  });

  return media;
};
