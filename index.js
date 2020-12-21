// 3-rd party Moduels
const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const {
  MondaySubj,
  TuesdaySubj,
  WednesdaySubj,
  ThursdaySubj,
  FridaySubj,
} = require("./models/subjectModel");

dotenv.config({ path: "./config.env" }); // defining environment variables
mongoose.connect(process.env.MONGO_URL); // connecting to MongoDB

// constant variables
const TOKEN = process.env.TOKEN;
const chatId = process.env.CHAT_ID; // variable needed to define the chat to which next day homework is sent

// Creating homework object with data taken from the database
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

// let variables
let html,
  day,
  subj,
  teacher,
  usersType = { give: [], add: [] };

// Create a bot variable - an instance of the TelegramBot class
const bot = new TelegramBot(TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
});

console.log("Bot have been started...");

// FUNCTIONS

const giveHomework = (day) => {
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

const resetUserId = (userID) => {
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

const sendMessage = (id, html, type, day) => {
  switch (type) {
    case "start":
      bot.sendMessage(id, html, {
        parse_mode: "HTML",
        disable_notification: true,
        reply_markup: {
          keyboard: [["Запиши", "Напиши"]],
        },
      });
      break;
    case "days":
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
    case "teachers":
      bot.sendMessage(id, html, {
        parse_mode: "HTML",
        disable_notification: true,
        reply_markup: {
          keyboard: [
            [day[1].subject, day[2].subject, day[3].subject],
            [day[4].subject, day[5].subject, day[6].subject],
            [day[7].subject, day[8].subject],
            [day[0].subject, "Назад"],
          ],
        },
      });
      break;
    case "done":
      bot.sendMessage(id, html, {
        parse_mode: "HTML",
        disable_notification: true,
        reply_markup: {
          keyboard: [["Готово", "Очистить"]],
        },
      });
      break;
  }
};

// COMMAND LISTENERS

bot.onText(/\/start/, (msg) => {
  const { id } = msg.chat;

  if (msg.chat.id !== msg.from.id) {
    // Creating response message
    html = `
  <strong>Привет, ${msg.from.first_name}!</strong>
  <i>Меня зовут лягушонок ПЕПЕ и я нужен для того чтобы помочь разобраться с этой глупой домашкой!</i>
  <pre>Сюда я буду кидать домашку на завтра, а если хочешь узнать или записать что-то - жду тебя в личных сообщениях</pre>`;

    // Sending response message
    bot.sendMessage(id, html, {
      parse_mode: "HTML",
      disable_notification: true,
    });
    return;
  }

  // Creating response message
  html = `
  <strong>Привет, ${msg.from.first_name}!</strong>
  <i>Меня зовут лягушонок ПЕПЕ и я нужен для того чтобы помочь разобраться с этой глупой домашкой!</i>
  <pre>Выбери что тебе нужно: Чтобы я записал или написал домашку</pre>`;

  sendMessage(id, html, "start");
});

bot.onText(/\/getchatid/, (msg) => {
  const { id } = msg.chat;
  html = `<strong>ID of the Chat => ${msg.chat.id}</strong>`;
  bot.sendMessage(id, html, {
    parse_mode: "HTML",
    disable_notification: true,
  });
});

bot.onText(/Напиши/, (msg) => {
  const { id } = msg.chat;

  if (msg.chat.id !== msg.from.id) {
    return;
  }

  // Set user id to give type
  usersType.give.push(msg.from.id);

  // Creating response message
  html = `
    <strong>${msg.from.first_name},</strong>
    <i>За какой день скинуть дз?</i>`;

  sendMessage(id, html, "days");
});

bot.onText(/Запиши/, (msg) => {
  const { id } = msg.chat;

  if (msg.chat.id !== msg.from.id) {
    return;
  }

  // Set user id to add type
  usersType.add.push(msg.from.id);

  // Creating response message
  html = `
      <strong>${msg.from.first_name},</strong>
      <i>На когда записать дз?</i>`;

  sendMessage(id, html, "days");
});

bot.onText(/Назад/, (msg) => {
  const { id } = msg.chat;

  if (msg.chat.id !== msg.from.id) {
    return;
  }

  resetUserId(msg.from.id);

  // Creating response message
  html = `
        <strong>${msg.from.first_name},</strong>
        <i>Что мне сделать?</i>`;

  sendMessage(id, html, "start");
});

// ALL MESSAGE LISTENER
bot.on("message", async (msg) => {
  try {
    const { id } = msg.chat;

    let homeworkData, type;

    if (msg.chat.id !== msg.from.id) {
      return;
    }

    // Set type depending on which list the user is in
    usersType.give.forEach((el) => {
      if (el === msg.from.id) {
        type = "give";
      }
    });
    usersType.add.forEach((el) => {
      if (el === msg.from.id) {
        type = "add";
      }
    });

    if (type === "give") {
      switch (msg.text) {
        case "Понедельник":
          homeworkData = giveHomework(homework.Monday);
          break;
        case "Вторник":
          homeworkData = giveHomework(homework.Tuesday);
          break;
        case "Среда":
          homeworkData = giveHomework(homework.Wednesday);
          break;
        case "Четверг":
          homeworkData = giveHomework(homework.Thursday);
          break;
        case "Пятница":
          homeworkData = giveHomework(homework.Friday);
          break;
        default:
          return;
      }

      // Creating response message
      html = `
      <strong>Домашка:</strong>
    <i>${homeworkData[0]}</i>`;

      sendMessage(id, html, "days");

      if (homeworkData[1].length !== 0) {
        homeworkData[1].forEach((el) => {
          // Sending photos
          bot.sendPhoto(id, el, {
            parse_mode: "HTML",
            disable_notification: true,
          });
        });
      }
    } else if (type === "add") {
      const { id } = msg.chat;
      let isDay, cursubj;
      isDay = true;

      switch (msg.text) {
        case "Понедельник":
          day = homework.Monday;
          break;
        case "Вторник":
          day = homework.Tuesday;
          break;
        case "Среда":
          day = homework.Wednesday;
          break;
        case "Четверг":
          day = homework.Thursday;
          break;
        case "Пятница":
          day = homework.Friday;
          break;
        case "Назад":
          return;
        default:
          isDay = false;
      }

      if (isDay) {
        // Creating response message
        html = `
    <strong>Какой предмет хочешь запиcать?</strong>`;

        sendMessage(id, html, "teachers", day);
      }

      if (day) {
        day.forEach((el, i) => {
          if (el.subject === msg.text) {
            if (el.subject !== day[i - 1].subject) {
              subj = el;
            } else {
              subj = day[i - 1];
            }
          }
        });
      }
      if (subj) {
        switch (day) {
          case homework.Monday:
            cursubj = await MondaySubj.findOne({ subject: subj.subject });
            break;
          case homework.Tuesday:
            cursubj = await TuesdaySubj.findOne({ subject: subj.subject });
            break;
          case homework.Wednesday:
            cursubj = await WednesdaySubj.findOne({ subject: subj.subject });
            break;
          case homework.Thursday:
            cursubj = await ThursdaySubj.findOne({ subject: subj.subject });
            break;
          case homework.Friday:
            cursubj = await FridaySubj.findOne({ subject: subj.subject });
            break;
          case "Назад":
            return;
        }
      }

      if (msg.text === "Готово") {
        resetUserId(msg.from.id);

        html = `<strong> Что мне сделать? </strong>`;

        sendMessage(id, html, "start");

        subj = undefined;
      } else if (msg.text === "Очистить") {
        resetUserId(msg.from.id);

        if (subj.groups.length === 0) {
          // updating subj
          subj.text = "";
          subj.photo = "";
          // updating cursubj
          cursubj.text = "";
          cursubj.photo = "";
        } else {
          // updating subj
          subj.groups.forEach((el, i) => {
            if (el.teacher === teacher) {
              el.text = "";
              el.photo = "";
              // updating cursubj
              cursubj.groups[i].text = "";
              cursubj.groups[i].photo = "";
            }
          });
        }

        await cursubj.save();

        html = `<strong> Что мне сделать? </strong>`;

        sendMessage(id, html, "start");

        subj = undefined;
      } else if (subj === undefined) {
        return;
      } else if (
        subj.subject === "Английский" ||
        subj.subject === "Украинский" ||
        subj.subject === "Испанский"
      ) {
        switch (subj.subject) {
          case "Английский":
            if (msg.text === subj.subject) {
              group = undefined;

              html = `В какой ты группе?`;

              // Sending response message
              bot.sendMessage(id, html, {
                parse_mode: "HTML",
                disable_notification: true,
                reply_markup: {
                  // remove_keyboard: isback,
                  keyboard: [
                    [
                      subj.groups[0].teacher,
                      subj.groups[1].teacher,
                      subj.groups[2].teacher,
                    ],
                    ["Назад"],
                  ],
                },
              });
            }
            break;
          case "Испанский":
          case "Украинский":
            if (msg.text === subj.subject) {
              group = undefined;

              html = `В какой ты группе?`;

              // Sending response message
              bot.sendMessage(id, html, {
                parse_mode: "HTML",
                disable_notification: true,
                reply_markup: {
                  // remove_keyboard: isback,
                  keyboard: [
                    [subj.groups[0].teacher, subj.groups[1].teacher],
                    ["Назад"],
                  ],
                },
              });
            }
        }

        subj.groups.forEach((el) => {
          if (msg.text === el.teacher) {
            // Creating response message
            html = `
          <strong>Скидывай текст или/и фото с домашкой</strong>
          <i>Я запишу её как домашка по предмету ${subj.subject}</i>
          `;
            sendMessage(id, html, "done");

            switch (msg.text) {
              case subj.groups[0].teacher:
                teacher = subj.groups[0].teacher;
                group = 0;
                break;
              case subj.groups[1].teacher:
                teacher = subj.groups[1].teacher;
                group = 1;
                break;
              case subj.groups[2].teacher:
                teacher = subj.groups[2].teacher;
                group = 2;
                break;
            }
          }
        });

        if (
          msg.text === subj.groups[0].teacher ||
          msg.text === subj.groups[1].teacher ||
          (subj.groups[2] !== undefined && msg.text === subj.groups[2].teacher)
        )
          return;

        if (group !== undefined) {
          if (msg.text !== undefined) {
            subj.groups[group].text = msg.text;
            cursubj.groups[group].text = msg.text;
          } else {
            subj.groups[group].photo = msg.photo[2].file_id;
            cursubj.groups[group].photo = msg.photo[2].file_id;
          }
          // Saving data to DB
          await cursubj.save();
        }
      } else if (msg.text === subj.subject) {
        // Creating response message
        html = `
      <strong>Скидывай текст или/и фото с домашкой</strong>
      <i>Я запишу её как домашка по предмету ${subj.subject}</i>
      `;

        sendMessage(id, html, "done");
      } else {
        if (msg.text !== undefined) {
          // update data
          subj.text = msg.text;
          cursubj.text = msg.text;
        } else {
          // update data
          subj.photo = msg.photo[2].file_id;
          cursubj.photo = msg.photo[2].file_id;
        }
        // Saving data to DB
        await cursubj.save();
      }
    }
  } catch (err) {
    console.error(err);
  }
});

// Interval that sends data every day in 18:00
setInterval(() => {
  // Saving current Date to date variable
  const date = new Date();
  let data;

  // Checking whether current date match needed date
  if (
    date.getHours() === 17 &&
    date.getMinutes() === 00 &&
    date.getDay() !== 6 &&
    date.getDay() !== 5
  ) {
    switch (date.getDay()) {
      case 0:
        data = giveHomework(homework.Monday);
        break;
      case 1:
        data = giveHomework(homework.Tuesday);
        break;
      case 2:
        data = giveHomework(homework.Wednesday);
        break;
      case 3:
        data = giveHomework(homework.Thursday);
        break;
      case 4:
        data = giveHomework(homework.Friday);
        break;
    }
    // Creating response message
    const html = `
            <strong>Домашка на завтра:</strong>
      <i>${data[0]}</i>
            `;

    // Sending response message
    bot.sendMessage(chatId, html, {
      parse_mode: "HTML",
      disable_notification: true,
    });

    if (data[1].length !== 0) {
      data[1].forEach((el) => {
        // Sending photos
        bot.sendPhoto(chatId, el, {
          parse_mode: "HTML",
          disable_notification: true,
        });
      });
    }
  }
}, 59000);

bot.on("polling_error", (err) => console.log(err));

require("http")
  .createServer()
  .listen(process.env.PORT || 5000)
  .on("request", function (req, res) {
    res.end("");
  });
