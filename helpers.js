/*function to check if email already exist */
const getUserByEmail = function (email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return true;
    }
  }
  return false;
}

module.exports = { getUserByEmail};