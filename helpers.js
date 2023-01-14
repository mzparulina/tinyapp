// Helper functions
/**
 * Get User from Users database
 * @param {string} user id to be searched on users database
 * @param {obj} userDatabase users database
 * @returns {object} users data
 */
const getUser = (id, users) => {
  return users[id];
};
/**
 * return all the users that match the inputted email value
 * @param {string} email to be searched on users database
 * @param {obj} userDatabase users database
 * @returns {object} users data
 */
const getUserByEmail = (val, users) => {
  return objecValueFinder(users, 'email', val);
};
/**
 * return all the urls that match the inputted longurl value
 * @param {string} url to be searched on url database
 * @param {obj} urlDatabase users database
 * @returns {object} urls data
 */
const getLongURL = (val, urlDatabase) => {
  return objecValueFinder(urlDatabase, 'longURL', val);
};
/**
 * find and return object that match on the inputted value
 * @param {obj} nested object to look for
 * @param {string} key from the object that is being searched for
 * @param {string} value that is being searched for
 * @returns {object}
 */
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
/**
 * find and return object that match on the inputted value
 * @param {string} user user's id from the user object {id, email, password}
 * @param {obj} urlDatabase
 * @returns {object}
 */
const urlsForUser = (val, urlDatabase) => {
  const userUrls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === val) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
};
/**
 * checks if url id exists on url database
 * @param {string} url id
 * @param {obj} urldatabase
 * @returns {boolean} returns true if id found else false
 */
const isValidUrl = (id, urlDatabase) => {
  if (urlDatabase[id]) {
    return true;
  }
  return false;
};
/**
* Checks if the shortUrl belongs to the user
* @param {string} shortUrl key of urlDatabase
* @param {object} user user object
* @param {object} urlDatabase URL database
* @returns {boolean} true if the url's user id is user.id. false otherwise
*/
const isUserUrl = (shortUrl, user, urlDatabase) => {
  if (isValidUrl(shortUrl, urlDatabase) && urlDatabase[shortUrl].userId === user.id) {
    return true;
  }
  return false;
};
/**
* Generate random string and number for ids
* @param {number} size of string/number
* @returns {string} random lowercase tring and number
*/
const generateRandomString = (len) => {
  return Math.random().toString(36).substring(2, len);
};

module.exports = {
  getLongURL,
  getUser,
  getUserByEmail,
  urlsForUser,
  isUserUrl,
  isValidUrl,
  generateRandomString
};