const {
  MondaySubj,
  TuesdaySubj,
  WednesdaySubj,
  ThursdaySubj,
  FridaySubj,
} = require("./../models/subjectModel");

let loggedUsersVar;

const loggedUsers = require("./../models/passModel");

exports.giveHomework = (day) => {
  let data = ``,
    photos = [], // arr to store all photos of the day
    photo, // [PHOTO] that is attached to each homework that has a photo
    groupPhoto = []; // [PHOTO] that is attached to each homework that has a photo and divided into groups

  // Looping over each object to define the one that is divided into groups and additional info object
  day.forEach((el, index) => {
    if (day[index - 1] !== undefined && day[index - 1].subject !== el.subject) {
      groupPhoto = [];
    }

    // add [PHOTO] at the end of homework that has photo
    if (el.groups.length === 0) {
      el.photo ? (photo = "[PHOTO]") : (photo = "");
    } else if (day[index - 1].subject === el.subject) {
    } else {
      el.groups.forEach((group) => {
        group.photo ? groupPhoto.push("[PHOTO]") : groupPhoto.push("");
      });
    }

    // add all photos of the day to photos array
    if (el.groups.length === 0 && el.photo !== "") {
      photos.push(el.photo);
    } else {
      el.groups.forEach((el) => {
        if (el.photo !== "") {
          photos.push(el.photo);
        }
      });
    }

    switch (el.subject) {
      case "Доп. инфа":
        // if current element is 'additional info' - add it to data without numbering in the list
        data += `<strong>${el.subject}:</strong> ${el.text} ${photo}
      `;

        break;
      case "Английский":
        // if current element is English - add it to data with groups as child elements

        if (day[index - 1].subject === el.subject) {
          groupdataEng = `
          Н.А: ${day[index - 1].groups[0].text} ${groupPhoto[0]}
          А.П: ${day[index - 1].groups[1].text} ${groupPhoto[1]}
          А.Г: ${day[index - 1].groups[2].text} ${groupPhoto[2]}`;

          data += `<strong>${index}.${el.subject}:</strong> ${groupdataEng}
      `;
        } else if (day[index + 1].subject === el.subject) {
          data += `<strong>${index}.${el.subject},</strong>
      `;
        } else {
          groupdataEng = `
          Н.А: ${el.groups[0].text} ${groupPhoto[0]}
          А.П: ${el.groups[1].text} ${groupPhoto[1]}
          А.Г: ${el.groups[2].text} ${groupPhoto[2]}`;

          data += `<strong>${index}.${el.subject}:</strong> ${groupdataEng}
      `;
        }
        break;
      case "Испанский":
        // if current element is Spanish - add it to data with groups as child elements

        groupdataEsp = `
          Л.В: ${el.groups[0].text} ${groupPhoto[0]}
          С.Л: ${el.groups[1].text} ${groupPhoto[1]}`;

        data += `<strong>${index}.${el.subject}:</strong> ${groupdataEsp}
      `;
        break;
      case "Украинский":
        // if current element is Ukrainian - add it to data with groups as child elements
        if (day[index - 1].subject === el.subject) {
          groupdataUkr = `
          А.В: ${day[index - 1].groups[0].text} ${groupPhoto[0]} 
          Л.А: ${day[index - 1].groups[1].text} ${groupPhoto[1]}`;

          data += `<strong>${index}.${el.subject}:</strong> ${groupdataUkr}
      `;
        } else {
          data += `<strong>${index}.${el.subject},</strong>
      `;
        }
        break;
      case "-":
        break;
      default:
        // if current element isn't additional info or one with groups - add it to data
        data += `<strong>${index}.${el.subject}:</strong> ${el.text} ${photo}
      `;
    }
  });
  return [data, photos];
};

exports.resetUserId = (usersType, userID) => {
  usersType.give.forEach((el, i) => {
    if (el === userID) {
      usersType.give.splice(i, 1);
    }
  });
  usersType.add.forEach((el, i) => {
    if (el === userID) {
      usersType.add.splice(i, 1);
    }
  });
};

exports.sendMessage = (bot, id, html, type, options) => {
  switch (type) {
    case "start":
      // Sending response message
      bot.sendMessage(id, html, {
        parse_mode: "HTML",
        disable_notification: true,
        reply_markup: {
          keyboard: [["Запиши", "Напиши"]],
        },
      });
      break;
    case "days":
      // Sending response message
      bot.sendMessage(id, html, {
        parse_mode: "HTML",
        disable_notification: true,
        reply_markup: {
          keyboard: [
            ["Понедельник", "Вторник", "Среда"],
            ["Четверг", "Пятница"],
            ["Назад"],
          ],
        },
      });
      break;
    case "subjects":
      // Creating response message
      html = `
        <strong>Какой предмет хочешь запиcать?</strong>`;

      // Sending response message
      bot.sendMessage(id, html, {
        parse_mode: "HTML",
        disable_notification: true,
        reply_markup: {
          keyboard: [
            [
              options.day[1].subject,
              options.day[2].subject,
              options.day[3].subject,
            ],
            [
              options.day[4].subject,
              options.day[5].subject,
              options.day[6].subject,
            ],
            [options.day[7].subject, options.day[8].subject],
            [options.day[0].subject, "Назад"],
          ],
        },
      });
      break;
    case "done":
      // Creating response message
      html = `
        <strong>Скидывай текст или/и фото с домашкой</strong>
        <i>Я запишу её как домашка по предмету ${options.subj.subject}</i>
        `;

      // Sending response message
      bot.sendMessage(id, html, {
        parse_mode: "HTML",
        disable_notification: true,
        reply_markup: {
          keyboard: [["Готово", "Очистить"]],
        },
      });
      break;
    case "teachers-2":
      // Creating response message
      html = `В какой ты группе?`;

      // Sending response message
      bot.sendMessage(id, html, {
        parse_mode: "HTML",
        disable_notification: true,
        reply_markup: {
          keyboard: [
            [options.subj.groups[0].teacher, options.subj.groups[1].teacher],
            ["Назад"],
          ],
        },
      });
      break;
    case "teachers-3":
      // Creating response message
      html = `В какой ты группе?`;

      // Sending response message
      bot.sendMessage(id, html, {
        parse_mode: "HTML",
        disable_notification: true,
        reply_markup: {
          keyboard: [
            [
              options.subj.groups[0].teacher,
              options.subj.groups[1].teacher,
              options.subj.groups[2].teacher,
            ],
            ["Назад"],
          ],
        },
      });
      break;
    case "none":
      // Sending response message
      bot.sendMessage(id, html, {
        parse_mode: "HTML",
        disable_notification: true,
      });
      break;
  }
};

exports.findSubject = (doc, subject) => {
  switch (doc) {
    case "Monday":
      return MondaySubj.findOne({ subject });
    case "Tuesday":
      return TuesdaySubj.findOne({ subject });
    case "Wednesday":
      return WednesdaySubj.findOne({ subject });
    case "Thursday":
      return ThursdaySubj.findOne({ subject });
    case "Friday":
      return FridaySubj.findOne({ subject });
  }
};

exports.resetSubjects = (doc) => {
  switch (doc) {
    case "Monday":
      MondaySubj.find((err, msg) => {
        msg.forEach(async (el) => {
          if (el.groups.length !== 0) {
            el.groups.forEach((el) => {
              el.text = "";
              el.photo = "";
            });
          } else {
            el.text = "";
            el.photo = "";
          }
          await el.save();
        });
      });
    case "Tuesday":
      TuesdaySubj.find((err, msg) => {
        msg.forEach(async (el) => {
          if (el.groups.length !== 0) {
            el.groups.forEach((el) => {
              el.text = "";
              el.photo = "";
            });
          } else {
            el.text = "";
            el.photo = "";
          }
          await el.save();
        });
      });
    case "Wednesday":
      WednesdaySubj.find((err, msg) => {
        msg.forEach(async (el) => {
          if (el.groups.length !== 0) {
            el.groups.forEach((el) => {
              el.text = "";
              el.photo = "";
            });
          } else {
            el.text = "";
            el.photo = "";
          }
          await el.save();
        });
      });
    case "Thursday":
      ThursdaySubj.find((err, msg) => {
        msg.forEach(async (el) => {
          if (el.groups.length !== 0) {
            el.groups.forEach((el) => {
              el.text = "";
              el.photo = "";
            });
          } else {
            el.text = "";
            el.photo = "";
          }
          await el.save();
        });
      });
    case "Friday":
      FridaySubj.find((err, msg) => {
        msg.forEach(async (el) => {
          if (el.groups.length !== 0) {
            el.groups.forEach((el) => {
              el.text = "";
              el.photo = "";
            });
          } else {
            el.text = "";
            el.photo = "";
          }
          await el.save();
        });
      });
  }
};

exports.getHomeworkData = () => {
  let homework = {};
  MondaySubj.find((err, msg) => {
    homework.Monday = msg;
  });
  TuesdaySubj.find((err, msg) => {
    homework.Tuesday = msg;
  });
  WednesdaySubj.find((err, msg) => {
    homework.Wednesday = msg;
  });
  ThursdaySubj.find((err, msg) => {
    homework.Thursday = msg;
  });
  FridaySubj.find((err, msg) => {
    homework.Friday = msg;
  });

  return homework;
};

exports.checkLoggedUser = async (user_id) => {
  try {
    loggedUsersVar = await loggedUsers.findOne({
      _id: "5fef8ccf82a7bc607cd66d49",
    });
    return loggedUsersVar.loggedUsers.includes(user_id);
  } catch (err) {
    console.error(err);
  }
};

exports.deleteLoggedUser = async (user_id) => {
  try {
    loggedUsersVar = await loggedUsers.findOne({
      _id: "5fef8ccf82a7bc607cd66d49",
    });
    if (loggedUsersVar.loggedUsers.includes(user_id)) {
      loggedUsersVar.loggedUsers.forEach((el, i) => {
        if (el === user_id) {
          loggedUsersVar.loggedUsers.splice(i, 1);
          loggedUsersVar.save();
        }
      });
    } else {
      console.log("Requested user is not in the array");
    }
  } catch (err) {
    console.error(err);
  }
};

exports.addLoggedUser = async (user_id) => {
  try {
    loggedUsersVar = await loggedUsers.findOne({
      _id: "5fef8ccf82a7bc607cd66d49",
    });
    if (!loggedUsersVar.loggedUsers.includes(user_id)) {
      loggedUsersVar.loggedUsers.push(user_id);
      loggedUsersVar.save();
    } else {
      console.log("This user is already logged in");
    }
  } catch (err) {
    console.error(err);
  }
};
