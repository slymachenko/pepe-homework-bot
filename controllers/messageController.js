module.exports = (type, options) => {
  let response;

  switch (type) {
    case "/start":
      response = `Hi, ${options.username}\n/help for more info`;
      break;
    case "/help":
      response = "Help info";
      break;
    case "/create_class":
      response = options.err
        ? "<b>ERROR: please provide className and classPassword</b>\nName and password must be without spaces!\n\nExample:\n/create_class className classPassword"
        : `Class has been successfully created!\n\nName: ${options.className}\nID: ${options.classID}\nPassword: ${options.classPass}\n\nShare this ID and password with your classmates`;
      break;
    case "/delete_class":
      response = `Class has been successfully deleted!\n\nName: ${options.className}\nID: ${options.classID}\nPassword: ${options.classPass}`;
      if (options.err)
        response =
          "<b>ERROR: please provide existing classID and classPassword</b>\nName and password must be without spaces!\n\nExample:\n/delete_class classID classPassword";
      if (options.validErr)
        response =
          "<b>ERROR: there's no Class with that ID and password. Please provide valid ID and password</b>\nID and password must be without spaces!\n\nExample:\n/delete_class classID classPassword";
      break;
  }

  return response;
};
