const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const homeworkController = require("./controllers/homeworkController");
const subjectController = require("./controllers/subjectController");
const dayController = require("./controllers/dayController");

const TOKEN = process.env.TOKEN;

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

bot.onText(/^\/start$/, (msg) => {
  const { id } = msg.chat;

  const response = `
  <strong>Привет, ${msg.from.first_name}!</strong>
  <i>Меня зовут лягушонок ПЕПЕ и я помогу тебе разобраться с этой глупой домашкой!
  
/help for more info</i>`;

  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/help$/, (msg) => {
  const { id } = msg.chat;

  const response = `
  <strong>/note *day* *subject* *homework*</strong> - notes homework for specific subject
  (for example: /note 0 Физ-ра взять гачи костюм)
  <strong>/show *day* *subject*(optional)</strong> - shows homework for the day or for the specific subject
  (for example: '/show 0', '/show 0 Физ-ра')
  
  0 - Mon
  1 - Tue
  2 - Wed
  3 - Thu
  4 - Fri`;

  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/note/, async (msg) => {
  const { id } = msg.chat;

  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };

  const textOptions = msg.text.split(" ");
  const dayIndex = textOptions[1];
  const subject = textOptions[2];

  textOptions.splice(0, 3);
  const homework = textOptions.join(" ");

  // DAY VALIDATION
  if (!new RegExp("^[0-6]$").test(dayIndex)) {
    const response = `wrong dayIndex`;

    return bot.sendMessage(id, response, options);
  }

  const subjects = await subjectController.findDaySubjects(dayIndex);

  // SUBJECT VALIDATION
  if (!subjects.includes(subject)) {
    const response = `wrong subject`;

    return bot.sendMessage(id, response, options);
  }

  // HOMEWORK VALIDATION
  if (homework.length === 0) {
    const response = `there's no homework text`;

    return bot.sendMessage(id, response, options);
  }

  homeworkController.updateHomework(dayIndex, subject, homework);

  const response = `homework has been updated`;

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/show/, async (msg) => {
  const { id } = msg.chat;

  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };

  const textOptions = msg.text.split(" ");
  const dayIndex = textOptions[1];
  const subjectName = textOptions[2];

  // DAY VALIDATION
  if (!new RegExp("^[0-6]$").test(dayIndex)) {
    const response = `wrong dayIndex`;

    return bot.sendMessage(id, response, options);
  }

  if (subjectName) {
    const subjects = await subjectController.findDaySubjects(dayIndex);

    // SUBJECT VALIDATION
    if (!subjects.includes(subjectName)) {
      const response = `wrong subject`;

      return bot.sendMessage(id, response, options);
    }

    const response = await homeworkController.findSubjHomework(
      dayIndex,
      subjectName
    );

    return bot.sendMessage(id, response, options);
  }

  const response = await homeworkController.findDayHomework(dayIndex);

  bot.sendMessage(id, response, options);
});

bot.on("polling_error", (err) => console.log(err));

// Sending an empty response on request
require("http")
  .createServer()
  .listen(process.env.PORT || 5000)
  .on("request", function (req, res) {
    res.end("");
  });
