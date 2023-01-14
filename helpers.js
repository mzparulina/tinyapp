const getUser = (id, users) => {
  return users[id];
};

const getUserByEmail = (val, users) => {
  return objecValueFinder(users, 'email', val);
};

const getLongURL = (val, urlDatabase) => {
  return objecValueFinder(urlDatabase, 'longURL', val);
};

const objecValueFinder = (obj, key, val) => {
  let foundObj;
  JSON.stringify(obj, (_, nestedValue) => {
    if (nestedValue && nestedValue[key] === val) {
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

const isValidUrl = (url, urlDatabase) => {
  if (urlDatabase[url]) {
    return true;
  }
  return false;
};

const isUserUrl = (shortUrl, user, urlDatabase) => {
  if (isValidUrl(shortUrl, urlDatabase) && urlDatabase[shortUrl].userId === user.id) {
    return true;
  }
  return false;
};

const generateRandomString = (len) => {
  return Math.random().toString(36).substring(2, len);
};

module.exports = {
  // isRegisteredEmail,
  getLongURL,
  getUser,
  getUserByEmail,
  urlsForUser,
  isUserUrl,
  isValidUrl,
  generateRandomString
};