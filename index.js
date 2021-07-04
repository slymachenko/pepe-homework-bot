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

const options = {
  parse_mode: "HTML",
  disable_notification: true,
};

// COMMAND LISTENERS

bot.onText(/^\/start$/, (msg) => {
  const { id } = msg.chat;

  const response = `
  <strong>Привет, ${msg.from.first_name}!</strong>
  <i>Меня зовут лягушонок ПЕПЕ и я помогу тебе разобраться с этой глупой домашкой!
  
/help for more info</i>`;

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/help$/, (msg) => {
  const { id } = msg.chat;

  const response = `
  <strong>/note *day* *subject* *homework*</strong> - notes homework for specific subject
  (for example: /note 0 Физ-ра взять гачи костюм)
  <strong>/show *day* *subject*(optional)</strong> - shows homework for the day or for the specific subject
  (for example: '/show 0', '/show 0 Физ-ра')
  
  1 - Mon
  2 - Tue
  3 - Wed
  4 - Thu
  5 - Fri`;

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/note/, async (msg) => {
  const { id } = msg.chat;

  const [, dayIndex, subjName, ...textOptions] = msg.text.split(" ");

  const homeworkText = textOptions.join(" ");

  const response = await homeworkController.updateHomework(
    dayIndex,
    subjName,
    homeworkText
  );

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/show/, async (msg) => {
  const { id } = msg.chat;

  const textOptions = msg.text.split(" ");
  const dayIndex = textOptions[1];
  const subjectName = textOptions[2];

  // DAY VALIDATION
  if (!new RegExp("^[1-7]$").test(dayIndex)) {
    const response = `wrong dayIndex`;

    return bot.sendMessage(id, response, options);
  }

  if (subjectName) {
    const subjects = await subjectController.findDaySubjects(dayIndex);

    // DAY VALIDATION
    if (subjects === null) {
      const response = `wrong dayIndex`;

      return bot.sendMessage(id, response, options);
    }

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
