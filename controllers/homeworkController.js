const dayController = require("./dayController");

exports.updateHomework = async (dayIndex, subjectName, hwText) => {
  try {
    const day = await dayController.findDay(dayIndex);

    if (day === null) return "wrong dayIndex";

    const subjectIndex = day.subjects.findIndex(
      (el) => (el.subject = subjectName)
    );

    day.subjects[subjectIndex].text = hwText || day.subjects[subjectIndex].text;

    day.save();
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
      let line;
      if (el.group) {
        line = `
    <strong>${el.subject}(${el.group}):</strong> ${el.text}`;
      } else {
        line = `
    <strong>${el.subject}:</strong> ${el.text}`;
      }

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
      if (subject.group) {
        homeworkData += `
<strong>${subject.subject}(${subject.group}): ${subject.text}</strong>`;
      } else {
        homeworkData += `
<strong>${subject.subject}: ${subject.text}</strong>`;
      }
    });

    return homeworkData;
  } catch (err) {
    console.error(err);
  }
};
