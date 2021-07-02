const dayController = require("./dayController");

exports.findDaySubjects = async (dayIndex) => {
  try {
    const day = await dayController.findDay(dayIndex);

    if (day === null) return "wrong dayIndex";

    const subjects = [];

    day.subjects.forEach((el) => {
      if (!subjects.includes(el.subject)) {
        subjects.push(el.subject);
      }
    });

    return subjects;
  } catch (err) {
    console.error(err);
  }
};
