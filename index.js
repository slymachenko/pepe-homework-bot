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
const { createCipher } = require("crypto");

dotenv.config({ path: "./config.env" });
mongoose.connect(process.env.MONGO_URL);

// constant variables
const TOKEN = process.env.TOKEN;
const chatId = process.env.CHAT_ID; // variable needed to define the chat to which next day homework is sent
const url = process.env.MONGO_URL;
// const homework = JSON.parse(fs.readFileSync("./dev-data/data/homework.json"));

// const subjec = new TuesdaySubj({
//   subject: "Доп. инфа",
//   text: "",
//   photo: "",
// });

// const subjec = new FridaySubj({
//   subject: "Английский",
//   groups: [
//     {
//       teacher: "Н.А.",
//       text: "Н.А: ",
//       photo: "",
//     },
//     {
//       teacher: "А.П.",
//       text: "А.П: ",
//       photo: "",
//     },
//     {
//       teacher: "А.Г.",
//       text: "А.Г: ",
//       photo: "",
//     },
//   ],
// });

// const subjec = new TuesdaySubj({
//   subject: "Укр.мова",
//   groups: [
//     // {
//     //   teacher: "Л.В.",
//     //   text: "Л.В: ",
//     //   photo: "",
//     // },
//     // {
//     //   teacher: "С.Л.",
//     //   text: "С.Л: ",
//     //   photo: "",
//     // },
//     {
//       teacher: "А.В.",
//       text: "А.В: ",
//       photo: "",
//     },
//     {
//       teacher: "Л.А.",
//       text: "Л.А: ",
//       photo: "",
//     },
//   ],
// });

// subjec.save((err, msg) => {
//   console.log("SAVED");
// });
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
let type, html, day, subj;

// Saving new TelegramBot to bot variable
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
  // Clear previous data
  let data = ``;
  // Looping over each object to define the one that is divided into groups and ADD INFO object
  day.forEach((el, index) => {
    switch (el.subject) {
      case "Доп. информация":
        // case it's add info
        data += `<strong>${el.subject}:</strong> ${el.text}
    `;

        break;
      case "Английский":
        // case it's English

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
        //case it's Spanish

        groupdataEsp = `
        Л.В: ${el.groups[0].text}
        С.Л: ${el.groups[1].text}`;

        data += `<strong>${index}.${el.subject}:</strong> ${groupdataEsp}
    `;
        break;
      case "Украинский":
        // case it's Ukrainian
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
        // groupdataUkr = `
        // ${el.groups[0].text}
        // ${el.groups[1].text}`;

        // data += `<strong>${index}.${el.subject}:</strong> ${groupdataUkr}
        // `;
        break;
      case "-":
        break;
      default:
        // case it's common subject
        data += `<strong>${index}.${el.subject}:</strong> ${el.text}
    `;
    }
  });
  return data;
};

// COMMAND LISTENERS

bot.onText(/\/start/, (msg) => {
  const { id } = msg.chat;

  // Creating response message
  html = `
  <strong>Привет, ${msg.from.first_name}!</strong>
  <i>Меня зовут лягушонок ПЕПЕ и я нужен для того чтобы помочь разобраться с этой глупой домашкой!</i>
  <pre>Выбери что тебе нужно: Чтобы я записал или написал домашку?</pre>`;

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

  // Set type variable to give
  type = "give";

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

  // Set type variable to give
  type = "add";

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

    let homeworkData;

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
            //   remove_keyboard: isback,
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
                  keyboard: [["Готово"]],
                },
              });
            } else if (msg.text === subj.groups[1].teacher) {
              group = 1;

              // Sending response message
              bot.sendMessage(id, html, {
                parse_mode: "HTML",
                disable_notification: true,
                reply_markup: {
                  keyboard: [["Готово"]],
                },
              });
            } else if (msg.text === subj.groups[2].teacher) {
              group = 2;

              // Sending response message
              bot.sendMessage(id, html, {
                parse_mode: "HTML",
                disable_notification: true,
                reply_markup: {
                  keyboard: [["Готово"]],
                },
              });
            }

            if (group === 0) {
              subj.groups[0].text = msg.text;
              // Updating document
              cursubj.groups[0].text = msg.text;
            } else if (group === 1) {
              subj.groups[1].text = msg.text;
              // Updating document
              cursubj.groups[1].text = msg.text;
            } else if (group === 2) {
              subj.groups[2].text = msg.text;
              // Updating document
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
                  keyboard: [["Готово"]],
                },
              });
            } else if (msg.text === subj.groups[1].teacher) {
              group = 1;

              // Sending response message
              bot.sendMessage(id, html, {
                parse_mode: "HTML",
                disable_notification: true,
                reply_markup: {
                  keyboard: [["Готово"]],
                },
              });
            }

            if (group === 0) {
              subj.groups[0].text = msg.text;
              // Updating document
              cursubj.groups[0].text = msg.text;
            } else if (group === 1) {
              subj.groups[1].text = msg.text;
              // Updating document
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
                  keyboard: [["Готово"]],
                },
              });
            } else if (msg.text === subj.groups[1].teacher) {
              group = 1;

              // Sending response message
              bot.sendMessage(id, html, {
                parse_mode: "HTML",
                disable_notification: true,
                reply_markup: {
                  keyboard: [["Готово"]],
                },
              });
            }

            if (group === 0) {
              // Updating subj
              subj.groups[0].text = msg.text;
              // Updating document
              cursubj.groups[0].text = msg.text;
            } else if (group === 1) {
              // Updating subj
              subj.groups[1].text = msg.text;
              // Updating document
              cursubj.groups[1].text = msg.text;
            }

            // Saving data to DB
            await cursubj.save();

          // subj.groups.forEach((el, index) => {
          //   cursubj.groups[index].text = el.text;
          //   subj.groups[0] = el.text;
          //   await cursubj.save();
          // });
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
            keyboard: [["Готово"]],
          },
        });
      } else {
        // Save data to subject
        // if (msg.text !== undefined) subj.text = msg.text;

        if (msg.text !== undefined) {
          // updating subj
          subj.text = msg.text;
          // updating cursubj
          cursubj.text = msg.text;
          // saving cursubj to DB
          await cursubj.save();
          // fs.writeFileSync(
          //   "./dev-data/data/homework.json",
          //   JSON.stringify(homework, null, 2)
          // );
        }

        // if (msg.photo !== undefined) {
        //   subj.photo = msg.photo[0].file_id;
        // } else if (msg.text !== undefined) {
        //   subj.text = msg.text;
        // }
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
  // Checking whether current date match needed date
  if (
    date.getHours() === 18 &&
    date.getMinutes() === 00 &&
    date.getDay() !== 6 &&
    date.getDay() !== 5
  ) {
    switch (date.getDay()) {
      case 0:
        giveHomework(homework.Monday);
        break;
      case 1:
        giveHomework(homework.Tuesday);
        break;
      case 2:
        giveHomework(homework.Wednesday);
        break;
      case 3:
        giveHomework(homework.Thursday);
        break;
      case 4:
        giveHomework(homework.Friday);
        break;
    }
    // Making response message
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
