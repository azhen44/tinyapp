// GENERATE RANDOM STRING -------------------------------
function generateRandomString() {
  let result = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 6; i ++) {
    randomChar = char.charAt(Math.floor(Math.random() * char.length))
    result += randomChar;
  }
  return result;
}

// Email Checker -------------------------------------------------
function emailChecker (email, database) {
  if (!email) {
    return true;
  }
  for (const user in database) {
    if (email === database[user]['email']) {
      return true;
    }
  }
  return false
};
// get User by Email ------------------------------------------

function getUserByEmail (email, database) {
  for (const data in database) {
    //console.log(database[data])
    if (database[data].email = email) {
      return database[data].id
    }
  }
};

module.exports ={generateRandomString, emailChecker, getUserByEmail};