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
const messageController = require("./controllers/messageController");

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
  const username = msg.from.first_name;

  const response = messageController.responseMessage("start", { username });

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/help$/, (msg) => {
  const { id } = msg.chat;

  const response = messageController.responseMessage("help");

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

  if (!dayIndex && !subjectName) {
    const response = await homeworkController.findAllHomework();

    return bot.sendMessage(id, response, options);
  }

  if (subjectName) {
    const subjects = await subjectController.findDaySubjects(dayIndex);

    // DAY VALIDATION
    if (subjects === null) {
      const response = messageController.responseMessage("dayIndexErr");

      return bot.sendMessage(id, response, options);
    }

    // SUBJECT VALIDATION
    if (!subjects.includes(subjectName)) {
      const response = messageController.responseMessage("subjErr");

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

bot.onText(/^\/clear/, async (msg) => {
  const { id } = msg.chat;

  const [, dayIndex, subjName] = msg.text.split(" ");

  const response = await homeworkController.clearHomework(dayIndex, subjName);

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
