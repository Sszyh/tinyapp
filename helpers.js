const bcrypt = require("bcryptjs");
/*function to check if email already exist */
const getUserByEmail = function (email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return true;
    }
  }
  return false;
}
/*function to generate random string*/
const generateRandomString = function() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  };
  return result;
};

const findKeyByValue = function (object, value) {
  let keyArray = Object.keys(object);
  let output = "";
  for (let key of keyArray) {
    if (object[key] === value) {
      output = key;
    } else {
      output = undefined;
    }
  }
  return output;
};
/*function to check if password correct */
const checkPasswordByEmail = function (email, password, usersDatabase) {
  for (let user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      let hashedPassword = usersDatabase[user].password;
      return bcrypt.compareSync(password, hashedPassword);
    }
  }
  return false;
}
/*function to provide user's id by email */
const findIdByEmail = function (email, usersDatabase) {
  let output = "";
  for (let user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      output = user;
    }
  }
  return output;
}
/*function to return the URLs where the userID 
is equal to the id of the currently loggined user */
const urlsForUser = function (idOfCurrentUser, urlDatas) {
  let output = {};
  for (let id in urlDatas) {
    if (urlDatas[id].userID === idOfCurrentUser) {
      output[id] = urlDatas[id].longURL;
    }
  }
  return output;
}

module.exports = { 
  getUserByEmail, 
  generateRandomString,
  findKeyByValue,
  checkPasswordByEmail,
  findIdByEmail,
  urlsForUser
};