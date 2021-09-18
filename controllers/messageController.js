module.exports = (type, options) => {
  let response;

  switch (type) {
    case "/start":
      response = `Hi, ${options.username}\n/help for more info`;
      break;
    case "/help":
      response = "Help info";
      break;
    case "/create":
      response = options.err
        ? "<b>ERROR: please provide className and classPassword</b>\nName and password must be without spaces!\n\nExample:\n/create className classPassword"
        : `Class has been successfully created!\n\nName: ${options.className}\nID: ${options.classID}\nPassword: ${options.classPass}\n\nShare this ID and password with your classmates`;
      break;
    case "/delete":
      response = `Class has been successfully deleted!\n\nName: ${options.className}\nID: ${options.classID}\nPassword: ${options.classPass}`;
      if (options.validErr)
        response = "<b>ERROR: you are not in any class </b>";
      break;
    case "/join":
      response = `You successfully entered Class!\n\nName: ${options.className}\nID: ${options.classID}\nPassword: ${options.classPass}`;
      if (options.err)
        response = `<b>ERROR: please provide existing classID and classPassword</b>\nID and password must be without spaces!\n\nExample:\n/join classID classPassword`;
      if (options.validErr)
        response =
          "<b>ERROR: there's no Class with that ID and password. Please provide valid ID and password</b>\nID and password must be without spaces!\n\nExample:\n/join classID classPassword";
      break;
    case "/leave":
      response = `You successfully left the Class!\n\nName: ${options.className}\nID: ${options.classID}\nPassword: ${options.classPass}`;
      if (options.validErr)
        response = "<b>ERROR: you are not in any class </b>";
      break;
    case "/class":
      response = `Your class info:\n\nName: ${options.className}\nID: ${options.classID}\nPassword: ${options.classPass}\nNumber of users: ${options.usersNum}`;
      if (options.validErr)
        response = "<b>ERROR: you are not in any class </b>";
      if (!options.classPass) response = `${options.classID}`;
      if (!options.classID) response = `${options.classPass}`;
      break;
  }

  return response;
};
