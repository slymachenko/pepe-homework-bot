const dayController = require("./dayController");
const subjectController = require("./subjectController");

exports.updateHomework = async (dayIndex, subjName, hwText) => {
  try {
    const day = await dayController.findDay(dayIndex);
    const subjects = await subjectController.findDaySubjects(dayIndex);

    // VALIDATION
    if (day === null || !new RegExp("^[1-7]$").test(dayIndex))
      return `wrong dayIndex`;
    if (!subjects.includes(subjName)) return `wrong subject`;
    if (hwText.length === 0) return `there's no homework text`;

    const subjectIndex = day.subjects.findIndex(
      (el) => (el.subject = subjName)
    );

    day.subjects[subjectIndex].text = hwText || day.subjects[subjectIndex].text;

    day.save();
    return `homework has been updated`;
  } catch (err) {
    console.error(err);
  }
};

exports.findDayHomework = async (dayIndex) => {
  try {
    const day = await dayController.findDay(dayIndex);

    if (day === null) return "wrong dayIndex";

    let homeworkData = `<strong>Homework: </strong>`;

    day.subjects.forEach((el) => {
      let line = `
    <strong>${el.subject}:</strong> ${el.text}`;

      homeworkData += line;
    });

    return homeworkData;
  } catch (err) {
    console.error(err);
  }
};

exports.findSubjHomework = async (dayIndex, subjectName) => {
  try {
    const day = await dayController.findDay(dayIndex);

    if (day === null) return "wrong dayIndex";

    let homeworkData = ``;

    const subjects = [];
    day.subjects.forEach((el) => {
      if (el.subject === subjectName) {
        subjects.push(el);
      }
    });

    subjects.forEach((subject) => {
      homeworkData += `
<strong>${subject.subject}: ${subject.text}</strong>`;
    });

    return homeworkData;
  } catch (err) {
    console.error(err);
  }
};
