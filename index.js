const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const getResponse = require("./controllers/messageController");
const classController = require("./controllers/classController");

dotenv.config({ path: "./config.env" });

// connecting to the MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const TOKEN = process.env.TOKEN;

const bot = new TelegramBot(TOKEN, {
  webHook: {
    port: process.env.PORT,
  },
});

bot.setWebHook(`${process.env.URL}/bot/${process.env.TOKEN}`);

console.log("Bot have been started...");

const options = {
  parse_mode: "HTML",
  disable_notification: true,
};

// COMMAND LISTENERS

bot.onText(/^\/start$/, (msg, [source]) => {
  const { id } = msg.chat;
  const username = msg.from.first_name;

  const response = getResponse(source, { username });

  bot.sendMessage(id, response);
});

bot.onText(/^\/help$/, (msg, [source]) => {
  const { id } = msg.chat;

  const response = getResponse(source);

  bot.sendMessage(id, response);
});

bot.onText(/^\/create_class/, async (msg) => {
  const { id } = msg.chat;
  let response;

  const [source, className, classPass, ...text] = msg.text.split(" ");

  if (!className || !classPass || text.length > 0) {
    response = getResponse(source, { err: true });

    return bot.sendMessage(id, response, options);
  }

  const classID = await classController.createClass({
    name: className,
    password: classPass,
    users: [msg.from.id],
  });

  response = getResponse(source, { className, classID, classPass });

  await bot.sendMessage(id, response, options);
  await bot.sendMessage(id, `${classID}`);
  bot.sendMessage(id, classPass);
});

bot.onText(/^\/delete_class/, async (msg) => {
  const { id } = msg.chat;
  let response;

  const [source, classID, classPass, ...text] = msg.text.split(" ");

  if (!classID || !classPass || text.length > 0) {
    response = getResponse(source, { err: true });

    return bot.sendMessage(id, response, options);
  }

  const className = await classController.deleteClass(classID, classPass);

  response = getResponse(source, { className, classID, classPass });

  if (!className) response = getResponse(source, { validErr: true });

  bot.sendMessage(id, response, options);
});
