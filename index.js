// 3-rd party Moduels
const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const subjectController = require("./controllers/subjectController");

dotenv.config({ path: "./config.env" }); // defining environment variables
mongoose.connect(process.env.MONGO_URL); // connecting to MongoDB

// constant variables
const TOKEN = process.env.TOKEN;
const chatId = process.env.CHAT_ID; // variable needed to define the chat to which next day homework is sent
const pass = process.env.USER_PASSWORD;

// Creating homework object with data taken from the database
const homework = subjectController.getHomeworkData();

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

// COMMAND LISTENERS

bot.onText(new RegExp(pass), (msg) => {
  const { id } = msg.chat;

  subjectController.addLoggedUser(msg.from.id);
  html = `${msg.from.first_name}, вы зарегистрировались`;
  subjectController.sendMessage(bot, id, html, "none");
});

bot.onText(/^\/start$/, async (msg) => {
  const { id } = msg.chat;

  if (!(await subjectController.checkLoggedUser(msg.from.id))) {
    return;
  }

  // Creating response message
  html = `
  <strong>Привет, ${msg.from.first_name}!</strong>
  <i>Меня зовут лягушонок ПЕПЕ и я нужен для того чтобы помочь разобраться с этой глупой домашкой!</i>`;

  if (msg.chat.id !== msg.from.id) {
    // Creating response message
    html += `
  <pre>Сюда я буду кидать домашку на завтра, а если хочешь узнать или записать что-то - жду тебя в личных сообщениях</pre>`;

    // Sending response message
    subjectController.sendMessage(bot, id, html, "none");
    return;
  }

  // Creating response message
  html += `
  <pre>Выбери что тебе нужно: Чтобы я записал или написал домашку</pre>`;

  // Sending response message
  subjectController.sendMessage(bot, id, html, "start");
});

bot.onText(/\/getchatid/, async (msg) => {
  const { id } = msg.chat;

  if (!(await subjectController.checkLoggedUser(msg.from.id))) {
    return;
  }

  // Creating response message
  html = `<strong>ID of the Chat => ${msg.chat.id}</strong>`;
  // Sending response message
  subjectController.sendMessage(bot, id, html, "none");
});

bot.onText(/^Напиши$/, async (msg) => {
  const { id } = msg.chat;

  // Ignore any chat message
  if (msg.chat.id !== msg.from.id) {
    return;
  }

  if (!(await subjectController.checkLoggedUser(msg.from.id))) {
    return;
  }

  // Set user id to give type
  usersType.give.push(msg.from.id);

  // Creating response message
  html = `
    <strong>${msg.from.first_name},</strong>
    <i>За какой день скинуть дз?</i>`;

  // Sending response message
  subjectController.sendMessage(bot, id, html, "days");
});

bot.onText(/^Запиши$/, async (msg) => {
  const { id } = msg.chat;

  // Ignore any chat message
  if (msg.chat.id !== msg.from.id) {
    return;
  }

  if (!(await subjectController.checkLoggedUser(msg.from.id))) {
    return;
  }

  // Set user id to add type
  usersType.add.push(msg.from.id);

  // Creating response message
  html = `
      <strong>${msg.from.first_name},</strong>
      <i>На когда записать дз?</i>`;

  // Sending response message
  subjectController.sendMessage(bot, id, html, "days");
});

bot.onText(/^Назад$/, async (msg) => {
  const { id } = msg.chat;

  // Ignore any chat message
  if (msg.chat.id !== msg.from.id) {
    return;
  }

  if (!(await subjectController.checkLoggedUser(msg.from.id))) {
    return;
  }

  subjectController.resetUserId(usersType, msg.from.id);

  // Creating response message
  html = `
        <strong>${msg.from.first_name},</strong>
        <i>Что мне сделать?</i>`;

  // Sending response message
  subjectController.sendMessage(bot, id, html, "start");
});

// ALL MESSAGE LISTENER
bot.on("message", async (msg) => {
  try {
    const { id } = msg.chat;
    let homeworkData, type;

    // Ignore any chat message
    if (msg.chat.id !== msg.from.id) {
      return;
    }

    if (
      !(await subjectController.checkLoggedUser(msg.from.id)) &&
      msg.text !== pass
    ) {
      html = `<strong>${msg.from.first_name}, ВВЕДИТЕ ПАРОЛЬ</strong>
      Узнать пароль можно у моего создателя <pre>@senya_s408</pre>`;
      subjectController.sendMessage(bot, id, html, "none");
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
          homeworkData = subjectController.giveHomework(homework.Monday);
          break;
        case "Вторник":
          homeworkData = subjectController.giveHomework(homework.Tuesday);
          break;
        case "Среда":
          homeworkData = subjectController.giveHomework(homework.Wednesday);
          break;
        case "Четверг":
          homeworkData = subjectController.giveHomework(homework.Thursday);
          break;
        case "Пятница":
          homeworkData = subjectController.giveHomework(homework.Friday);
          break;
        default:
          return;
      }

      // Creating response message
      html = `
      <strong>Домашка:</strong>
      <i>${homeworkData[0]}</i>`;

      // Sending response message
      subjectController.sendMessage(bot, id, html, "days");

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
      let isDay = true,
        cursubj;

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
        // Creating and Sending response message
        subjectController.sendMessage(bot, id, html, "subjects", { day });
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
            cursubj = await subjectController.findSubject(
              "Monday",
              subj.subject
            );
            break;
          case homework.Tuesday:
            cursubj = await subjectController.findSubject(
              "Tuesday",
              subj.subject
            );
            break;
          case homework.Wednesday:
            cursubj = await subjectController.findSubject(
              "Wednesday",
              subj.subject
            );
            break;
          case homework.Thursday:
            cursubj = await subjectController.findSubject(
              "Thursday",
              subj.subject
            );
            break;
          case homework.Friday:
            cursubj = await subjectController.findSubject(
              "Friday",
              subj.subject
            );
            break;
          case "Назад":
            return;
        }
      }

      if (msg.text === "Готово") {
        subjectController.resetUserId(usersType, msg.from.id);

        // Creating response message
        html = `<strong> Что мне сделать? </strong>`;

        // Sending response message
        subjectController.sendMessage(bot, id, html, "start");

        subj = undefined;
      } else if (msg.text === "Очистить") {
        subjectController.resetUserId(usersType, msg.from.id);

        // Clear subj and cursubj
        if (subj.groups.length === 0) {
          // case this subject without groups
          subj.text = "";
          subj.photo = "";
          cursubj.text = "";
          cursubj.photo = "";
        } else {
          // case this subject is divided in groups
          subj.groups.forEach((el, i) => {
            if (el.teacher === teacher) {
              el.text = "";
              el.photo = "";
              cursubj.groups[i].text = "";
              cursubj.groups[i].photo = "";
            }
          });
        }

        await cursubj.save();

        // Creating response message
        html = `<strong> Что мне сделать? </strong>`;

        // Sending response message
        subjectController.sendMessage(bot, id, html, "start");

        subj = undefined;
      } else if (subj === undefined) {
        return;
      } else if (subj.groups.length > 0) {
        switch (subj.subject) {
          case "Английский":
            if (msg.text === subj.subject) {
              group = undefined;

              // Creating and Sending response message
              subjectController.sendMessage(bot, id, html, "teachers-3", {
                subj,
              });
            }
            break;
          case "Испанский":
          case "Украинский":
            if (msg.text === subj.subject) {
              group = undefined;

              // Creating and Sending response message
              subjectController.sendMessage(bot, id, html, "teachers-2", {
                subj,
              });
            }
        }

        subj.groups.forEach((el) => {
          if (msg.text === el.teacher) {
            // Sending response message
            subjectController.sendMessage(bot, id, html, "done", { subj });

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
        // Creating and Sending response message
        subjectController.sendMessage(bot, id, html, "done", { subj });
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
    date.getHours() === 15 &&
    date.getMinutes() === 00 &&
    date.getDay() !== 6 &&
    date.getDay() !== 5
  ) {
    switch (date.getDay()) {
      case 0:
        data = subjectController.giveHomework(homework.Monday);
        break;
      case 1:
        data = subjectController.giveHomework(homework.Tuesday);
        break;
      case 2:
        data = subjectController.giveHomework(homework.Wednesday);
        break;
      case 3:
        data = subjectController.giveHomework(homework.Thursday);
        break;
      case 4:
        data = subjectController.giveHomework(homework.Friday);
        break;
    }
    // Creating response message
    const html = `
            <strong>Домашка на завтра:</strong>
      <i>${data[0]}</i>
            `;

    // Sending response message
    subjectController.sendMessage(bot, id, html, "none");

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

// Sending an empty HTTP response on request
require("http")
  .createServer()
  .listen(process.env.PORT || 5000)
  .on("request", function (req, res) {
    res.end("");
  });
