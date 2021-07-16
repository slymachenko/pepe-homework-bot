const dayController = require("./dayController");
const subjectController = require("./subjectController");
const messageController = require("./messageController");

exports.updateHomework = async (dayIndex, subjName, options) => {
  try {
    const day = await dayController.findDay(dayIndex);
    const subjects = await subjectController.findDaySubjects(dayIndex);

    // VALIDATION
    if (day === null || !new RegExp("^[1-7]$").test(dayIndex))
      return messageController.responseMessage("dayIndexErr");
    if (!subjects.includes(subjName))
      return messageController.responseMessage("subjErr");
    if (!options.homeworkText && !options.photo)
      return messageController.responseMessage("hwText&photoErr");

    const subjectIndex = day.subjects.findIndex(
      (el) => el.subject === subjName
    );

    day.subjects[subjectIndex].text =
      options.homeworkText || day.subjects[subjectIndex].text;
    day.subjects[subjectIndex].photo =
      options.photo || day.subjects[subjectIndex].photo;

    day.save();
    return `homework has been updated`;
  } catch (err) {
    console.error(err);
  }
};

exports.findAllHomework = async () => {
  try {
    const days = await dayController.findAllDays();

    let response = `<strong>All homework:</strong>`;

    days.forEach((day) => {
      day.subjects.forEach((subj) => {
        if (subj.text.length > 0 || subj.photo.length > 0)
          response += `
${day.dayIndex} ${subj.subject}: ${subj.text} ${subj.photo ? `[PHOTO]` : ``}`;
      });
    });

    return response;
  } catch (err) {
    console.error(err);
  }
};

exports.findDayHomework = async (dayIndex) => {
  try {
    const day = await dayController.findDay(dayIndex);

    const response = messageController.responseMessage("dayIndexErr");

    if (day === null) return response;

    let homeworkData = `<strong>Homework: </strong>`;

    day.subjects.forEach((subj) => {
      let line = `
    <strong>${subj.subject}:</strong> ${subj.text} ${
        subj.photo ? `[PHOTO]` : ``
      }`;

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

    const response = messageController.responseMessage("dayIndexErr");

    if (day === null) return response;

    let homeworkData = ``;
    let photo = ``;

    const subjects = [];
    day.subjects.forEach((el) => {
      if (el.subject === subjectName) {
        subjects.push(el);
      }
    });

    subjects.forEach((subject) => {
      homeworkData += `
<strong>${subject.subject}: ${subject.text}</strong>`;
      photo = subject.photo;
    });

    return { homeworkData, photo };
  } catch (err) {
    console.error(err);
  }
};

exports.clearHomework = async (dayIndex, subjName) => {
  try {
    const day = await dayController.findDay(dayIndex);
    const subjects = await subjectController.findDaySubjects(dayIndex);

    // VALIDATION
    if (day === null || !new RegExp("^[1-7]$").test(dayIndex))
      return messageController.responseMessage("dayIndexErr");
    if (subjName && !subjects.includes(subjName))
      return messageController.responseMessage("subjErr");

    if (subjName) {
      const subjectIndex = day.subjects.findIndex(
        (el) => el.subject === subjName
      );

      day.subjects[subjectIndex].text = "";
      day.subjects[subjectIndex].photo = "";

      day.save();
      return `homework for ${subjName} has been cleared`;
    }

    day.subjects.forEach((el) => {
      el.text = "";
      el.photo = "";
    });

    day.save();
    return `homework for ${dayIndex} day has been cleared`;
  } catch (err) {
    console.error(err);
  }
};

exports.clearAllHomework = async () => {
  try {
    const days = await dayController.findAllDays();

    days.forEach((day) => {
      day.subjects.forEach((subj) => {
        subj.text = "";
        subj.photo = "";
      });

      day.save();
    });

    return `all homework has been cleared`;
  } catch (err) {
    console.error(err);
  }
};
