const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const getResponse = require("./controllers/messageController");
const classController = require("./controllers/classController");
const requestController = require("./controllers/requestController");
const homeworkController = require("./controllers/homeworkController");
const userController = require("./controllers/userController");

dotenv.config({ path: "./config.env" });

// connecting to the MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const TOKEN = process.env.TOKEN;

const bot = new TelegramBot(TOKEN, {
  webHook: {
    port: process.env.PORT,
  },
});

bot.setWebHook(`${process.env.URL}/bot/${process.env.TOKEN}`);

console.log("Bot have been started...");

// COMMAND LISTENERS

bot.onText(/^\/start/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userName = msg.from.first_name;
  const userID = msg.from.id;
  const username = msg.from.username || userName;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };
  const URL = msg.text.substr(msg.text.indexOf(" ") + 1);
  let response = getResponse(source, { userName });

  if (URL === source) return bot.sendMessage(id, response.start, options);

  // check if the user is a member of the class - send an error message
  const isUserinClass = await userController.checkUserinClass(userID);
  if (isUserinClass) return bot.sendMessage(id, response.classErr, options);

  const classDoc = await userController.addUsertoClass(URL, userID, username);
  if (!classDoc) return bot.sendMessage(id, response.classDeleteErr, options);

  const className = classDoc.name;
  response = getResponse(source, { userName, className });

  bot.sendMessage(id, response.success, options);
});

bot.onText(/^\/help$/, (msg, [source]) => {
  const { id } = msg.chat;
  const response = getResponse(source);
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/create/, async (msg) => {
  const { id } = msg.chat;
  const userName = msg.from.first_name;
  const userID = msg.from.id;
  const username = msg.from.username || userName;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };

  const [source, className, ...text] = msg.text.split(" ");
  const response = getResponse(source, { className });

  // user message validation
  if (!className || text.length > 0)
    return bot.sendMessage(id, response.msgErr, options);

  // check if the user is a member of the class - send an error message
  const isUserinClass = await userController.checkUserinClass(userID);
  if (isUserinClass) return bot.sendMessage(id, response.classErr, options);

  // creating document for class and homework
  await classController.createClass({
    name: className,
    users: [
      {
        userID,
        isAdmin: true,
        request: [],
        username,
      },
    ],
  });

  bot.sendMessage(id, response.success, options);
});

bot.onText(/^\/deleteclass$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const response = getResponse(source);
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };

  // check if the user is a member of the class
  const isUserinClass = await userController.checkUserinClass(userID);
  if (!isUserinClass) return bot.sendMessage(id, response.classErr, options);

  // check if the user is an admin
  const isUserAdmin = await userController.checkUserAdmin(userID);
  if (!isUserAdmin) return bot.sendMessage(id, response.permissionerr, options);

  options.reply_markup = {
    keyboard: [["Back", "Delete сlass"]],
    one_time_keyboard: true,
  };

  // saving '/deleteclass' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);
  bot.sendMessage(id, response.confirm, options);
});

bot.onText(/^\/leaveclass$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };
  let response = getResponse(source);

  const isClasshasSingleAdmin = await classController.checkClasshasSingleAdmin(
    userID
  );
  const isUserAdmin = await userController.checkUserAdmin(userID);
  if (isClasshasSingleAdmin && isUserAdmin)
    return bot.sendMessage(id, response.singleUserErr, options);

  // deleting user from the users array in Class document
  const classDoc = await classController.leaveClass(userID);

  if (!classDoc) return bot.sendMessage(id, response.classErr, options);

  const className = classDoc.name;
  response = getResponse(source, { className });

  bot.sendMessage(id, response.success, options);
});

bot.onText(/^\/classinfo$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const response = getResponse(source);
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };

  // retrieving class document from the db
  const classDoc = await classController.findClass(userID);

  // if there's no class with user in, send Error message
  if (!classDoc) return bot.sendMessage(id, response.classErr, options);

  bot.sendMessage(id, response.createClassInfoResponse(classDoc), options);
});

bot.onText(/^\/promoteuser$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const response = getResponse(source);
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };

  // check if the user is a member of the class
  const isUserinClass = await userController.checkUserinClass(userID);
  if (!isUserinClass) return bot.sendMessage(id, response.classErr, options);

  // check if the user is an admin
  const isUserAdmin = await userController.checkUserAdmin(userID);
  if (!isUserAdmin) return bot.sendMessage(id, response.permissionErr, options);

  options.reply_markup = {
    inline_keyboard: await userController.createUserButtons(userID),
  };

  // saving '/promoteuser' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);
  bot.sendMessage(id, response.selectUser, options);
});

bot.onText(/^\/demoteuser$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const response = getResponse(source);
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };

  // check if the user is a member of the class
  const isUserinClass = await userController.checkUserinClass(userID);
  if (!isUserinClass) return bot.sendMessage(id, response.classErr, options);

  // check if the user is an admin
  const isUserAdmin = await userController.checkUserAdmin(userID);
  if (!isUserAdmin) return bot.sendMessage(id, response.permissionErr, options);

  const isClasshasSingleAdmin = await classController.checkClasshasSingleAdmin(
    userID
  );
  if (isClasshasSingleAdmin && isUserAdmin)
    return bot.sendMessage(id, response.singleUserErr, options);

  options.reply_markup.inline_keyboard =
    await userController.createAdminButtons(userID);

  // saving '/demoteuser' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);
  bot.sendMessage(id, response.selectUser, options);
});

bot.onText(/^\/addsubject$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const response = getResponse(source);
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };

  // check if the user is a member of the class
  const isUserinClass = await userController.checkUserinClass(userID);
  if (!isUserinClass) return bot.sendMessage(id, response.classErr, options);

  // check if the user is an admin
  const isUserAdmin = await userController.checkUserAdmin(userID);
  if (!isUserAdmin) return bot.sendMessage(id, response.permissionErr, options);

  options.reply_markup = {
    keyboard: [
      ["Monday", "Tuesday", "Wednesday"],
      ["Thursday", "Friday"],
      ["Back"],
    ],
    one_time_keyboard: true,
  };

  // saving '/addsubject' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);
  bot.sendMessage(id, response.selectDay, options);
});

bot.onText(/^\/removesubject$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const response = getResponse(source);
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };

  // check if the user is a member of the class
  const isUserinClass = await userController.checkUserinClass(userID);
  if (!isUserinClass) return bot.sendMessage(id, response.classErr, options);

  // check if the user is an admin
  const isUserAdmin = await userController.checkUserAdmin(userID);
  if (!isUserAdmin) return bot.sendMessage(id, response.permissionErr, options);

  options.reply_markup = {
    keyboard: [
      ["Monday", "Tuesday", "Wednesday"],
      ["Thursday", "Friday"],
      ["Back"],
    ],
  };

  // saving '/removesubject' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);
  bot.sendMessage(id, response.selectDay, options);
});

bot.onText(/^\/note$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const response = getResponse(source);
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };

  // check if the user is a member of the class
  const isUserinClass = await userController.checkUserinClass(userID);
  if (!isUserinClass) return bot.sendMessage(id, response.classErr, options);

  // check if the user is an admin
  const isUserAdmin = await userController.checkUserAdmin(userID);
  if (!isUserAdmin) return bot.sendMessage(id, response.permissionErr, options);

  options.reply_markup = {
    keyboard: [
      ["Monday", "Tuesday", "Wednesday"],
      ["Thursday", "Friday"],
      ["Back"],
    ],
  };

  // saving '/note' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);
  bot.sendMessage(id, response.selectDay, options);
});

bot.onText(/^\/show$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const response = getResponse(source);
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };

  // check if the user is a member of the class
  const isUserinClass = await userController.checkUserinClass(userID);
  if (!isUserinClass) return bot.sendMessage(id, response.classErr, options);

  options.reply_markup = {
    keyboard: [
      ["Monday", "Tuesday", "Wednesday"],
      ["Thursday", "Friday", "All"],
      ["Back"],
    ],
  };

  // saving '/show' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);
  bot.sendMessage(id, response.selectDay, options);
});

bot.onText(/^\/clear$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const response = getResponse(source);
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };

  // check if the user is a member of the class
  const isUserinClass = await userController.checkUserinClass(userID);
  if (!isUserinClass) return bot.sendMessage(id, response.classErr, options);

  // check if the user is an admin
  const isUserAdmin = await userController.checkUserAdmin(userID);
  if (!isUserAdmin) return bot.sendMessage(id, response.permissionErr, options);

  options.reply_markup = {
    keyboard: [
      ["Monday", "Tuesday", "Wednesday"],
      ["Thursday", "Friday"],
      ["Back"],
    ],
  };

  // saving '/clear' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);
  bot.sendMessage(id, response.selectDay, options);
});

bot.onText(/^Back$|^back$/, async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const userName = msg.from.first_name;
  const source = "Back";
  const response = getResponse(source, { userName });
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };

  await requestController.clearRequest(userID);
  bot.sendMessage(
    id,
    response[Math.floor(Math.random() * response.length)],
    options
  );
});

bot.onText(/^Delete сlass$/, async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const source = "/deleteclass";
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };

  // check if the user made a request
  const request = await requestController.getRequest(userID);
  if (!request.includes("/deleteclass")) return;

  // deleting class document and clearing user request
  const classDoc = await classController.deleteClass(userID);

  const className = classDoc.name;
  const response = getResponse(source, { className });

  await requestController.clearRequest(userID);
  bot.sendMessage(id, response.success, options);
});

bot.onText(
  /^Monday$|^Tuesday$|^Wednesday$|^Thursday$|^Friday$/,
  async (msg, [weekday]) => {
    const { id } = msg.chat;
    const userID = msg.from.id;
    const options = {
      parse_mode: "HTML",
      disable_notification: true,
      reply_markup: {
        hide_keyboard: true,
      },
    };
    let source;
    let response;

    // check if the user made a request
    const request = await requestController.getRequest(userID);
    if (!request) return;
    if (
      !request.some((item) =>
        ["/addsubject", "/removesubject", "/note", "/show", "/clear"].includes(
          item
        )
      )
    )
      return;
    if (request.includes("/addsubject")) {
      source = "/addsubject";
      options.reply_markup = {
        inline_keyboard: [[{ text: "Back", callback_data: "Back" }]],
      };
    }
    if (request.includes("/removesubject")) {
      source = "/removesubject";
      options.reply_markup = {
        keyboard: await homeworkController.getSubjectsButtons(userID, weekday),
      };
    }
    if (request.includes("/note")) {
      source = "/note";
      response = getResponse(source, { day: weekday });

      // check if day has at least one subject
      const isSubjectinDay = await homeworkController.checkDayhasSubjects(
        userID,
        weekday
      );
      if (!isSubjectinDay) {
        await requestController.clearRequest(userID);
        return bot.sendMessage(id, response.subjectsErr, options);
      }

      options.reply_markup = {
        keyboard: await homeworkController.getSubjectsButtons(userID, weekday),
        one_time_keyboard: true,
      };
    }
    if (request.includes("/show")) {
      source = "/show";
      response = getResponse(source, { day: weekday });

      // check if day has at least one subject
      const isSubjectinDay = await homeworkController.checkDayhasSubjects(
        userID,
        weekday
      );
      if (!isSubjectinDay) {
        await requestController.clearRequest(userID);
        return bot.sendMessage(id, response.subjectsErr, options);
      }

      options.reply_markup = {
        keyboard: await homeworkController.getSubjectsButtons(userID, weekday),
        one_time_keyboard: true,
      };

      options.reply_markup.keyboard.splice(
        options.reply_markup.keyboard.length - 2,
        0,
        ["All Day"]
      );
    }
    if (request.includes("/clear")) {
      source = "/clear";
      response = getResponse(source, { day: weekday });

      // check if day has at least one subject
      const isSubjectinDay = await homeworkController.checkDayhasSubjects(
        userID,
        weekday
      );
      if (!isSubjectinDay) {
        await requestController.clearRequest(userID);
        return bot.sendMessage(id, response.subjectsErr, options);
      }

      options.reply_markup = {
        keyboard: await homeworkController.getSubjectsButtons(userID, weekday),
        one_time_keyboard: true,
      };
    }
    response = getResponse(source, { day: weekday });

    // saving weekday to the db to know users request in the future
    await requestController.updateRequest(userID, weekday);

    if (["/note", "/show", "/clear"].includes(request[0]))
      return bot.sendMessage(id, response.selectSubject, options);

    bot.sendMessage(id, response.sendMessage, options);
  }
);

bot.onText(
  /^[0-9]*\.[0-9]+\s[a-zA-Zа-яА-я]+|^[0-9]+\s[a-zA-Zа-яА-я]+/,
  async (msg) => {
    const { id } = msg.chat;
    const userID = msg.from.id;
    const options = {
      parse_mode: "HTML",
      disable_notification: true,
      reply_markup: {
        hide_keyboard: true,
      },
    };
    let source;
    let response;

    // check if the user made a request
    const request = await requestController.getRequest(userID);
    if (!request || request.length !== 2) return;

    const day = request[1];
    const [num, ...text] = msg.text.split(" ");
    const subjectIndex = parseFloat(parseFloat(num).toFixed(1));
    const subjectName = text.join(" ");

    if (subjectIndex > 12.9) {
      response = getResponse("/addsubject");

      return bot.sendMessage(id, respose.wrongSubjIndex, options);
    }

    if (request.includes("/addsubject")) {
      source = "/addsubject";
      response = getResponse(source, { subjectIndex, subjectName, day });

      const homeworkDoc = await homeworkController.createSubject(userID, {
        index: subjectIndex,
        name: subjectName,
        day,
      });

      if (!homeworkDoc) {
        await requestController.clearRequest(userID);
        return bot.sendMessage(id, response.msgErr, options);
      }

      return bot.sendMessage(id, response.success, options);
    }
    if (request.includes("/removesubject")) {
      source = "/removesubject";
      response = getResponse(source, { subjectIndex, subjectName, day });

      const homeworkDoc = await homeworkController.deleteSubject(userID, {
        name: subjectName,
        index: subjectIndex,
        day,
      });

      if (!homeworkDoc) {
        await requestController.clearRequest(userID);
        return bot.sendMessage(id, response.msgErr, options);
      }

      await requestController.clearRequest(userID);
      return bot.sendMessage(id, response.success, options);
    }
    if (request.includes("/show") && request.length === 2) {
      source = "/show";

      const subjectDoc = await homeworkController.getSubjectHomework(
        userID,
        day,
        subjectIndex,
        subjectName
      );

      response = getResponse(source).createSubjectHomeworkResponse(subjectDoc);

      await requestController.clearRequest(userID);

      if (subjectDoc.photo.length > 1) {
        const media = homeworkController.getMediaPhotoGroup(
          subjectDoc.photo,
          response
        );

        return bot.sendMediaGroup(id, media, options);
      }
      if (subjectDoc.photo.length === 1) {
        options.caption = response;

        return bot.sendPhoto(id, subjectDoc.photo[0], options);
      }

      bot.sendMessage(id, response, options);
    }
  }
);

bot.onText(/^All/, async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const source = "/show";
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };
  let response;

  const request = await requestController.getRequest(userID);
  if (!request) return;
  if (!request.includes(source)) return;
  response = getResponse(source, {
    day: request[1],
  });

  const [, text] = msg.text.split(" ");

  if (text === "Day") {
    // All Day
    const homework = await homeworkController.getDayHomework(
      userID,
      request[1]
    );

    await requestController.clearRequest(userID);
    return bot.sendMessage(
      id,
      response.createDayHomeworkResponse(homework),
      options
    );
  }
  // All
  const homework = await homeworkController.getAllHomework(userID);

  await requestController.clearRequest(userID);
  bot.sendMessage(id, response.createAllHomeworkResponse(homework), options);
});

bot.on("text", async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };
  let source;
  let response;

  if (
    msg.entities ||
    [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Back",
      "back",
      "Delete сlass",
      "All",
      "All Day",
    ].includes(msg.text)
  )
    return;

  // check if the user made a request
  const request = await requestController.getRequest(userID);
  if (!request) return;

  if (request.includes("/note")) {
    const day = request[1];
    source = "/note";
    options.reply_markup = {
      inline_keyboard: [[{ text: "Back", callback_data: "Back" }]],
    };

    if (request.length === 2) {
      // user message => SUBJECT
      const [, ...text] = msg.text.split(" ");
      const subjectName = text.join(" ");
      response = getResponse(source, { subjectName, day });

      const isSubjectinDay = await homeworkController.checkSubjectinDay(
        userID,
        day,
        subjectName
      );
      if (!isSubjectinDay) {
        options.reply_markup = {
          one_time_keyboard: true,
        };

        await requestController.clearRequest(userID);
        return bot.sendMessage(id, response.selectSubject, options);
      }

      // saving subject to the db to know users request in the future
      await requestController.updateRequest(userID, subjectName);
      return bot.sendMessage(id, response.sendMessage, options);
    }
    if (request.length === 3) {
      // user message => HOMEWORK
      const homeworkText = msg.text;
      const subjectName = request[2];
      response = getResponse(source, { subjectName, day });

      await homeworkController.addHomework(userID, day, subjectName, {
        text: homeworkText,
      });

      return bot.sendMessage(id, response.success, options);
    }
  }

  if (request.includes("/clear")) {
    const day = request[1];
    source = "/clear";
    // user message => SUBJECT

    const [, ...text] = msg.text.split(" ");
    const subjectName = text.join(" ");
    response = getResponse(source, { subjectName, day });

    const isSubjectinDay = await homeworkController.checkSubjectinDay(
      userID,
      day,
      subjectName
    );
    if (!isSubjectinDay) {
      options.reply_markup = {
        one_time_keyboard: true,
      };

      await requestController.clearRequest(userID);
      return bot.sendMessage(id, response.selectSubject, options);
    }

    await homeworkController.clearHomework(userID, day, subjectName);

    await requestController.clearRequest(userID);
    return bot.sendMessage(id, response.success, options);
  }
});

bot.on("photo", async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const photo_id = msg.photo[0].file_id;
  const homeworkText = msg.caption;
  const source = "/note";
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      inline_keyboard: [[{ text: "Back", callback_data: "Back" }]],
    },
  };

  // check if the user made a request
  const request = await requestController.getRequest(userID);
  if (!request || !request.includes(source) || request.length !== 3) return;

  const [, day, subjectName] = request;
  const response = getResponse(source, { subjectName, day });

  await homeworkController.addHomework(userID, day, subjectName, {
    text: homeworkText,
    photo: photo_id,
  });

  return bot.sendMessage(id, response.success, options);
});

bot.on("callback_query", async (data) => {
  const { id } = data.message.chat;
  const userID = data.from.id;
  const userName = data.from.first_name;
  const callback_query_id = data.id;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };
  let response;
  let source;

  if (data.data === "Back") {
    source = data.data;
    response = getResponse(data.data, { userName });

    bot.answerCallbackQuery(callback_query_id);

    await requestController.clearRequest(userID);
    bot.sendMessage(
      id,
      response[Math.floor(Math.random() * response.length)],
      options
    );
  }
  if (/^\d{9,9}$/.test(data.data)) {
    // check if the user made a request
    const request = await requestController.getRequest(userID);
    if (!request) return bot.answerCallbackQuery(callback_query_id);
    if (request.includes("/promoteuser")) {
      source = "/promoteuser";
      response = getResponse(source);

      await userController.promoteUser(userID, parseInt(data.data));
    }
    if (request.includes("/demoteuser")) {
      source = "/demoteuser";
      response = getResponse(source);

      const isClasshasSingleAdmin =
        await classController.checkClasshasSingleAdmin(userID);
      if (!isClasshasSingleAdmin) {
        bot.answerCallbackQuery(callback_query_id);
        return bot.sendMessage(id, response.singleUserErr, options);
      }

      await userController.demoteUser(userID, parseInt(data.data));
    }
    bot.answerCallbackQuery(callback_query_id);

    await requestController.clearRequest(userID);
    bot.sendMessage(id, response.success, options);
  }
});
