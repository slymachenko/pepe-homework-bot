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
  try {
    const { id } = msg.chat;

    const [, dayIndex, subjName, ...textOptions] = msg.text.split(" ");

    const homeworkText = textOptions.join(" ");

    const response = await homeworkController.updateHomework(
      dayIndex,
      subjName,
      homeworkText
    );

    bot.sendMessage(id, response, options);
  } catch (err) {
    console.error(err);
  }
});

bot.onText(/^\/show/, async (msg) => {
  try {
    const { id } = msg.chat;

    const textOptions = msg.text.split(" ");
    const dayIndex = textOptions[1];
    const subjName = textOptions[2];

    if (!dayIndex && !subjName) {
      const response = await homeworkController.findAllHomework();

      return bot.sendMessage(id, response, options);
    }

    if (subjName) {
      const subjects = await subjectController.findDaySubjects(dayIndex);

      // DAY VALIDATION
      if (subjects === null) {
        const response = messageController.responseMessage("dayIndexErr");

        return bot.sendMessage(id, response, options);
      }

      // SUBJECT VALIDATION
      if (!subjects.includes(subjName)) {
        const response = messageController.responseMessage("subjErr");

        return bot.sendMessage(id, response, options);
      }

      const response = await homeworkController.findSubjHomework(
        dayIndex,
        subjName
      );

      return bot.sendMessage(id, response, options);
    }

    const response = await homeworkController.findDayHomework(dayIndex);

    bot.sendMessage(id, response, options);
  } catch (err) {
    console.error(err);
  }
});

bot.onText(/^\/clear/, async (msg) => {
  try {
    const { id } = msg.chat;

    const [, dayIndex, subjName] = msg.text.split(" ");

    if (!dayIndex && !subjName) {
      const response = await homeworkController.clearAllHomework();

      return bot.sendMessage(id, response, options);
    }

    const response = await homeworkController.clearHomework(dayIndex, subjName);

    bot.sendMessage(id, response, options);
  } catch (err) {
    console.error(err);
  }
});

bot.on("polling_error", (err) => console.log(err));

// Sending an empty response on request
require("http")
  .createServer()
  .listen(process.env.PORT || 5000)
  .on("request", function (req, res) {
    res.end("");
  });
