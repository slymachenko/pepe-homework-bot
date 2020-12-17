// core moduels
const fs = require("fs");

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
  let data = ``; // clear previous data

  // Looping over each object to define the one that is divided into groups and additional info object
  day.forEach((el, index) => {
    switch (el.subject) {
      case "Доп. инфа":
        // if current element is 'additional info' - add it to data without numbering in the list
        data += `<strong>${el.subject}:</strong> ${el.text}
    `;

        break;
      case "Английский":
        // if current element is English - add it to data with groups as child elements

        if (day[index - 1].subject === el.subject) {
          groupdataEng = `
        Н.А: ${day[index - 1].groups[0].text}
        А.П: ${day[index - 1].groups[1].text}
        А.Г: ${day[index - 1].groups[2].text}`;

          data += `<strong>${index}.${el.subject}:</strong> ${groupdataEng}
    `;
        } else if (day[index + 1].subject === el.subject) {
          data += `<strong>${index}.${el.subject},</strong>
    `;
        } else {
          groupdataEng = `
        Н.А: ${el.groups[0].text}
        А.П: ${el.groups[1].text}
        А.Г: ${el.groups[2].text}`;

          data += `<strong>${index}.${el.subject}:</strong> ${groupdataEng}
    `;
        }
        break;
      case "Испанский":
        // if current element is Spanish - add it to data with groups as child elements

        groupdataEsp = `
        Л.В: ${el.groups[0].text}
        С.Л: ${el.groups[1].text}`;

        data += `<strong>${index}.${el.subject}:</strong> ${groupdataEsp}
    `;
        break;
      case "Украинский":
        // if current element is Ukrainian - add it to data with groups as child elements
        if (day[index - 1].subject === el.subject) {
          groupdataUkr = `
        А.В: ${day[index - 1].groups[0].text}
        Л.А: ${day[index - 1].groups[1].text}`;

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
        data += `<strong>${index}.${el.subject}:</strong> ${el.text}
    `;
    }
  });
  return data;
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

// COMMAND LISTENERS

bot.onText(/\/start/, (msg) => {
  const { id } = msg.chat;

  if (msg.chat.id !== msg.from.id) {
    // Creating response message
    html = `
  <strong>Привет, ${msg.from.first_name}!</strong>
  <i>Меня зовут лягушонок ПЕПЕ и я нужен для того чтобы помочь разобраться с этой глупой домашкой!
  Сюда я буду кидать домашку на завтра, а если хочешь узнать или записать что-то - Добро пожаловать в Личные сообщения</i>
  <pre>Выбери что тебе нужно: Чтобы я записал или написал домашку</pre>`;

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

  // Sending response message
  bot.sendMessage(id, html, {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      keyboard: [["Запиши", "Напиши"]],
    },
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

  // Sending response message
  bot.sendMessage(id, html, {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      keyboard: [["Запиши", "Напиши"]],
    },
  });
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
    <i>${homeworkData}</i>`;

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

        // Sending response message
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

        // Sending response message
        bot.sendMessage(id, html, {
          parse_mode: "HTML",
          disable_notification: true,
          reply_markup: {
            keyboard: [["Запиши", "Напиши"]],
          },
        });

        subj = undefined;
      } else if (msg.text === "Очистить") {
        resetUserId(msg.from.id);

        // updating subj
        subj.text = "";
        // updating cursubj
        cursubj.text = "";
        // saving cursubj to DB
        await cursubj.save();

        html = `<strong> Что мне сделать? </strong>`;

        // Sending response message
        bot.sendMessage(id, html, {
          parse_mode: "HTML",
          disable_notification: true,
          reply_markup: {
            keyboard: [["Запиши", "Напиши"]],
          },
        });

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

            // Creating response message
            html = `
               <strong>Скидывай текст с домашкой</strong>
               <i>Я запишу её как домашка по предмету ${subj.subject}</i>
               `;

            if (msg.text === subj.groups[0].teacher) {
              group = 0;

              // Sending response message
              bot.sendMessage(id, html, {
                parse_mode: "HTML",
                disable_notification: true,
                reply_markup: {
                  keyboard: [["Готово", "Очистить"]],
                },
              });
            } else if (msg.text === subj.groups[1].teacher) {
              group = 1;

              // Sending response message
              bot.sendMessage(id, html, {
                parse_mode: "HTML",
                disable_notification: true,
                reply_markup: {
                  keyboard: [["Готово", "Очистить"]],
                },
              });
            } else if (msg.text === subj.groups[2].teacher) {
              group = 2;

              // Sending response message
              bot.sendMessage(id, html, {
                parse_mode: "HTML",
                disable_notification: true,
                reply_markup: {
                  keyboard: [["Готово", "Очистить"]],
                },
              });
            }

            // Updating data
            if (group === 0) {
              subj.groups[0].text = msg.text;
              cursubj.groups[0].text = msg.text;
            } else if (group === 1) {
              subj.groups[1].text = msg.text;
              cursubj.groups[1].text = msg.text;
            } else if (group === 2) {
              subj.groups[2].text = msg.text;
              cursubj.groups[2].text = msg.text;
            }

            // Saving data to DB
            await cursubj.save();
            break;
          case "Испанский":
            if (msg.text === subj.subject) {
              group = undefined;

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

            // Creating response message
            html = `
               <strong>Скидывай текст с домашкой</strong>
               <i>Я запишу её как домашка по предмету ${subj.subject}</i>
               `;

            if (msg.text === subj.groups[0].teacher) {
              group = 0;

              // Sending response message
              bot.sendMessage(id, html, {
                parse_mode: "HTML",
                disable_notification: true,
                reply_markup: {
                  keyboard: [["Готово", "Очистить"]],
                },
              });
            } else if (msg.text === subj.groups[1].teacher) {
              group = 1;

              // Sending response message
              bot.sendMessage(id, html, {
                parse_mode: "HTML",
                disable_notification: true,
                reply_markup: {
                  keyboard: [["Готово", "Очистить"]],
                },
              });
            }

            // Updating data
            if (group === 0) {
              subj.groups[0].text = msg.text;
              cursubj.groups[0].text = msg.text;
            } else if (group === 1) {
              subj.groups[1].text = msg.text;
              cursubj.groups[1].text = msg.text;
            }

            // Saving data to DB
            await cursubj.save();
            break;
          case "Украинский":
            if (msg.text === subj.subject) {
              group = undefined;

              // day.forEach((el, i) => {
              //   if(el[i].subject === el[i+1].subject){
              //     el[i].text = el[i+1].text;
              //   }
              // })

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

            // Creating response message
            html = `
                  <strong>Скидывай текст с домашкой</strong>
                  <i>Я запишу её как домашка по предмету ${subj.subject}</i>
                  `;

            if (msg.text === subj.groups[0].teacher) {
              group = 0;

              // Sending response message
              bot.sendMessage(id, html, {
                parse_mode: "HTML",
                disable_notification: true,
                reply_markup: {
                  keyboard: [["Готово", "Очистить"]],
                },
              });
            } else if (msg.text === subj.groups[1].teacher) {
              group = 1;

              // Sending response message
              bot.sendMessage(id, html, {
                parse_mode: "HTML",
                disable_notification: true,
                reply_markup: {
                  keyboard: [["Готово", "Очистить"]],
                },
              });
            }

            // Updating data
            if (group === 0) {
              subj.groups[0].text = msg.text;
              cursubj.groups[0].text = msg.text;
            } else if (group === 1) {
              subj.groups[1].text = msg.text;
              cursubj.groups[1].text = msg.text;
            }

            // Saving data to DB
            await cursubj.save();
        }
      } else if (msg.text === subj.subject) {
        // Creating response message
        html = `
      <strong>Скидывай текст с домашкой</strong>
      <i>Я запишу её как домашка по предмету ${subj.subject}</i>
      `;

        // Sending response message
        bot.sendMessage(id, html, {
          parse_mode: "HTML",
          disable_notification: true,
          reply_markup: {
            keyboard: [["Готово", "Очистить"]],
          },
        });
      } else {
        if (msg.text !== undefined) {
          // update data
          subj.text = msg.text;
          cursubj.text = msg.text;
          // saving cursubj to DB
          await cursubj.save();
        }
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
      <i>${data}</i>
            `;

    // Sending response message
    bot.sendMessage(chatId, html, {
      parse_mode: "HTML",
      disable_notification: true,
    });
  }
}, 59000);

bot.on("polling_error", (err) => console.log(err));

require("http")
  .createServer()
  .listen(process.env.PORT || 5000)
  .on("request", function (req, res) {
    res.end("");
  });
