module.exports = (source, options) => {
  let response;
  options = options || {};

  switch (source) {
    case "/start":
      response = {
        start: `Hi, ${options.userName}\n/help for more information`,
        success: `Hi, ${options.userName}. You entered the <b>${options.className}</b> class!\n/help for more information`,
        classErr: `Hi, ${options.userName}. You are already in the class\n/help for more information`,
      };
      break;
    case "/help":
      response =
        "To add new member send a join link. You can get join link with /classinfo\nTo go back just type 'Back'\n\n<b>Class</b>\n/create *className* - creates a class with specified name\n/leaveclass - leave the class you're in\n/classinfo - gives information about the class you're in\n<b>Admin Commands</b>\n/deleteclass - deletes class\n/promoteuser - makes user an admin\n/demoteuser - removes administrator privileges\n\n<b>Subjects</b>\n<b>AdminCommands</b>\n/addsubject - adds subject on specified day with specified name\n/removesubject - removes from specified day with specified name\n\n<b>Homework</b>\n/show - shows homework(all, for the day, for the subject)\n<b>AdminCommands</b>\n/note - notes homework(text or/and photos) on specified day and subject\n/clear - clears homework(all, for the day, for the subject)";
      break;
    case "/getid":
      response = `Your user ID: ${options.userID}\nGive it to the admin of the class so you'll be able to got into the class`;
      break;
    case "/create":
      response = {
        success: `Class has been successfully created!\n\nName: ${options.className}`,
        msgErr:
          "<b>ERROR: please provide className</b>\nName must be without spaces!\n\nExample:\n/create className",
        classErr:
          "<b>ERROR: you are already in the class</b>\n\nTo create a new class you shouldn't be in any class",
      };
      break;
    case "/deleteclass":
      response = {
        success: `Class has been successfully deleted!\n\nName: ${options.className}`,
        confirm: `Are you sure you want to delete class? All subjects and homework will be deleted permanently`,
        permissionErr:
          "<b>ERROR: you don't have permission to delete the class</b>",
        classErr: "<b>ERROR: you are not in any class </b>",
      };
      break;
    case "/leaveclass":
      response = {
        success: `You successfully left the Class!\n\nName: ${options.className}`,
        singleUserErr: `<b>ERROR: you can't leave a class where you are the only administrator or the only member. /deleteclass first</b>`,
        classErr: "<b>ERROR: you are not in any class </b>",
      };
      break;
    case "/classinfo":
      response = {
        classErr: "<b>ERROR: you are not in any class </b>",
        createClassInfoResponse(classDoc) {
          const [className, usersNum, classURL] = [
            classDoc.name,
            classDoc.users.length,
            classDoc._id,
          ];
          let response = `Your class info:\n\nName: ${className}\nNumber of members: ${usersNum}\nInvite link: https://t.me/pepe_homework_bot?start=${classURL}`;
          let admins = `\n\nAdmins:\n`;
          let users = `\nMembers:\n`;

          classDoc.users.forEach((user) => {
            if (user.isAdmin) {
              admins += `<a href="tg://user?id=${user.userID}">@${user.username}</a>\n`;
            } else {
              users += `<a href="tg://user?id=${user.userID}">@${user.username}</a>\n`;
            }
          });

          response += admins;
          response += users;

          return response;
        },
      };
      break;
    case "/promoteuser":
      response = {
        success: "User has been promoted!",
        selectUser:
          "Please select user you want to promote\nIf you want to go back, click 'Back'",
        permissionErr:
          "<b>ERROR: you don't have permission to promote users</b>",
        classErr: "<b>ERROR: you are not in any class </b>",
        userClassErr: "<b>ERROR: user is not in the class </b>",
      };
      break;
    case "/demoteuser":
      response = {
        success: "User has been demoted!",
        selectUser:
          "Please select user you want to demote\nIf you want to go back, click 'Back'",
        permissionErr:
          "<b>ERROR: you don't have permission to demote users</b>",
        classErr: "<b>ERROR: you are not in any class </b>",
        singleUserErr: `<b>ERROR: you can't demote a user if this is the only administrator. /promoteuser first</b>`,
      };
      break;
    case "/addsubject":
      response = {
        success: `${options.subjectName} has been added on ${options.day} as a ${options.subjectIndex} class!`,
        selectDay:
          "Please select the day of the week to which you want to add the subject",
        sendMessage:
          "Please send me index number and name of the subject\nIndex number must be in the range 1-12\nIf you want to go back, click 'Back'\n\nExample:\n3.Electrical engineering - this message will add Electrical engineering as the 3-rd class",
        permissionErr:
          "<b>ERROR: you don't have permission to add subjects</b>",
        classErr: "<b>ERROR: you are not in any class </b>",
        msgErr: `<b>ERROR: there's a subject with the ${options.subjectIndex} index on ${options.day}\nRemove the subject with the ${options.subjectIndex} index and try again</b>`,
        wrongSubjIndex: `<b>ERROR: subject index must be an integer or float number with one digit after in the range 0-12.9`,
      };
      break;
    case "/removesubject":
      response = {
        success: `${options.subjectName} has been removed from ${options.day}\n${options.subjectName} was a ${options.subjectIndex} class!`,
        selectDay:
          "Please select the day of the week from which you want to remove the subject",
        sendMessage:
          "Please select the subject\n\nExample:\n3.Electrical engineering - this message will remove Electrical engineering",
        permissionErr:
          "<b>ERROR: you don't have permission to remove subjects</b>",
        classErr: "<b>ERROR: you are not in any class </b>",
        msgErr: `<b>ERROR: the ${options.subjectIndex} class is not ${options.subjectName}\nCheck your /schedule and try again</b>`,
      };
      break;
    case "/note":
      response = {
        success: `homework has been added to the ${options.subjectName} on ${options.day}`,
        selectDay:
          "Please select the day of the week to which you want to note homework",
        selectSubject: `Please select the subject of the ${options.day} to which you want to note homework`,
        sendMessage: `Please send me homework for the ${options.subjectName} on ${options.day}\nYou can send me photo or/and text\nIf you want to go back, click 'Back'`,
        permissionErr:
          "<b>ERROR: you don't have permission to add subjects</b>",
        classErr: "<b>ERROR: you are not in any class </b>",
        subjectsErr: `<b>ERROR: ${options.day} has no subjects</b>\nPlease add subject first`,
      };
      break;
    case "/show":
      response = {
        success: `Homework for ${options.day}:\n${options.homework}`,
        selectDay:
          "Please select the day of the week to which you want to note homework",
        selectSubject: `Please select the subject of the ${options.day} to which you want to note homework`,
        classErr: "<b>ERROR: you are not in any class </b>",
        subjectsErr: `<b>ERROR: ${options.day} has no subjects</b>\nPlease add subject first`,
        createAllHomeworkResponse(homework) {
          const days = Object.keys(homework);
          let response = `<b>Homework:</b>\n`;

          days.forEach((day) => {
            response += `\n<b>${day}:</b>\n`;
            homework[day].forEach((subject) => {
              response += `<b>${subject.subjectIndex}.${subject.subject}: ${
                subject.photo.length ? "[PHOTO]" : ""
              }</b>\n${subject.text ? `${subject.text}\n` : ""}`;
            });
          });

          return response;
        },
        createDayHomeworkResponse(homework) {
          const subjects = Object.keys(homework);
          let response = `<b>Homework for ${options.day}:</b>\n\n`;

          subjects.forEach((subject) => {
            response += `<b>${homework[subject].subjectIndex}.${
              homework[subject].subject
            }: ${homework[subject].photo.length ? "[PHOTO]" : ""}</b>\n${
              homework[subject].text ? `${homework[subject].text}\n` : ""
            }`;
          });

          return response;
        },
        createSubjectHomeworkResponse(subjectDoc) {
          return `<b>${subjectDoc.subjectIndex}.${subjectDoc.subject}: </b>${subjectDoc.text}`;
        },
      };
      break;
    case "/clear":
      response = {
        success: `homework for the ${options.subjectName} on ${options.day} has been cleared!`,
        selectDay:
          "Please select the day of the week which homework you want to clear",
        selectSubject: `Please select the subject of the ${options.day} which homework you want to clear`,
        permissionErr:
          "<b>ERROR: you don't have permission to clear subjects</b>",
        classErr: "<b>ERROR: you are not in any class </b>",
        subjectsErr: `<b>ERROR: ${options.day} has no subjects</b>\nPlease add subject first`,
      };
      break;
    case "Back":
      response = [
        `I'm waiting for your orders, ${options.userName}`,
        "If you'll need me, you know where to find me",
        "<b>Joke Time</b>\nWhat's the advantage of living in Switzerland?\nWell, the flag is a big plus.",
        "<b>Joke Time</b>\nOne day my robot friend went to buy some camo pants but couldn’t find any",
        "<b>Joke Time</b>\nWhat's is the robot's favorite kind of music?\nHeavy metal",
        "<b>Joke Time</b>\nThat's my favorite one:\n00110010 00101011 00110010 00111101 00110101\n😂🤣🤣😂🤣😂",
      ];
      break;
  }

  return response;
};
