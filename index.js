const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const getResponse = require("./controllers/messageController");
const classController = require("./controllers/classController");
const homeworkController = require("./controllers/homeworkController");

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

bot.onText(/^\/create/, async (msg) => {
  const { id } = msg.chat;
  let response;

  const [source, className, classPass, ...text] = msg.text.split(" ");

  if (!className || !classPass || text.length > 0) {
    response = getResponse(source, { err: true });

    return bot.sendMessage(id, response, options);
  }

  const classDoc = await classController.createClass({
    name: className,
    password: classPass,
    users: [msg.from.id],
  });

  const classID = classDoc._id;

  response = getResponse(source, { className, classID, classPass });

  await bot.sendMessage(id, response, options);
  await bot.sendMessage(id, `${classID}`);
  bot.sendMessage(id, classPass);
});

bot.onText(/^\/delete$/, async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const source = msg.text;
  let response;

  const classDoc = await classController.deleteClass(userID);

  if (!classDoc) {
    response = getResponse(source, { validErr: true });

    return bot.sendMessage(id, response, options);
  }

  const [className, classID, classPass] = [
    classDoc.name,
    classDoc._id,
    classDoc.password,
  ];

  response = getResponse(source, { className, classID, classPass });

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/join/, async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  let response;

  const [source, classID, classPass, ...text] = msg.text.split(" ");

  if (!classID || !classPass || text.length > 0) {
    response = getResponse(source, { err: true });
    return bot.sendMessage(id, response, options);
  }

  const classDoc = await classController.joinClass(classID, classPass, userID);
  if (classDoc) {
    className = classDoc.name;
    response = getResponse(source, { className, classID, classPass });
  }

  if (!classDoc) response = getResponse(source, { validErr: true });

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/leave$/, async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const source = msg.text;
  let response;

  const classDoc = await classController.leaveClass(userID);

  const [className, classID, classPass] = [
    classDoc.name,
    classDoc._id,
    classDoc.password,
  ];

  response = getResponse(source, { className, classID, classPass });

  if (!classDoc) response = getResponse(source, { validErr: true });

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/class/, async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const [source, ...text] = msg.text.split(" ");
  let response;

  const classDoc = await classController.findClass(userID);

  if (!classDoc) {
    response = getResponse(source, { validErr: true });
    return bot.sendMessage(id, response, options);
  }

  const [className, classID, classPass, usersNum] = [
    classDoc.name,
    classDoc._id,
    classDoc.password,
    classDoc.users.length,
  ];

  switch (text[0]) {
    case "id":
      response = getResponse(source, { classID });
      break;
    case "pass":
      response = getResponse(source, { classPass });
      break;
    default:
      response = getResponse(source, {
        className,
        classID,
        classPass,
        usersNum,
      });
  }

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/add/, async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const [source, dayIndex, subjectName, subjectIndex, ...text] =
    msg.text.split(" ");
  const subjectObj = {
    subjectIndex,
    subject: subjectName,
    text: "",
    photo: "",
  };
  let response;

  if (!subjectName || !subjectIndex || text.length > 0) {
    response = getResponse(source, { err: true });

    return bot.sendMessage(id, response, options);
  }

  const homeworkDoc = await homeworkController.addSubject(
    userID,
    subjectObj,
    dayIndex,
    subjectIndex
  );

  if (!homeworkDoc) {
    response = getResponse(source, { validErr: true });

    return bot.sendMessage(id, response, options);
  }

  response = getResponse(source, { subjectName, dayIndex });

  bot.sendMessage(id, response, options);
});

// bot.onText(/^\/remove/, (msg) => {
//   const { id } = msg.chat;
// });

// bot.onText(/^\/note/, (msg) => {
//   const { id } = msg.chat;
// });

// bot.onText(/^\/show/, (msg) => {
//   const { id } = msg.chat;
// });

// bot.onText(/^\/schedule/, (msg) => {
//   const { id } = msg.chat;
// });

// bot.on("photo", (msg) => {
//   const { id } = msg.chat;
// });
