const getUser = (id, users) => {
  return users[id];
};

const getUserByEmail = (val, users) => {
  let foundObj;
  JSON.stringify(users, (_, nestedValue) => {
    if (nestedValue && nestedValue['email'] === val) {
      foundObj = nestedValue;
    }
    return nestedValue;
  });
  return foundObj;
};

const urlsForUser = (val, urlDatabase) => {
  const userUrls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === val) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
};

const generateRandomString = (len) => {
  return Math.random().toString(36).substring(2, len);
};

module.exports = {
  // isRegisteredEmail,
  getUser,
  getUserByEmail,
  urlsForUser,
  // isUserUrl,
  // isValidUrl,
  generateRandomString
};