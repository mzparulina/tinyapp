const { assert } = require('chai');

const {
  getUser,
  getUserByEmail,
  urlsForUser,
} = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrls = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
  i2BoGr: {
    longURL: "https://www.googles.ca",
    userID: "user2RandomID",
  },
};

describe('getUserByEmail()', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = testUsers.userRandomID;
    assert.deepEqual(user, expectedOutput);
  });

  it('should return undefined with an invalid email', () => {
    const user = getUserByEmail('noUser@example.com', testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

describe('getUser()', () => {
  it('should return a user with a given valid ID', () => {
    const user = getUser('userRandomID', testUsers);
    const expectedOutput = testUsers.userRandomID;
    assert.deepEqual(user, expectedOutput);
  });
  it('should return undefined with an given invalid ID', () => {
    const user = getUser('noUser@example.com', testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

describe('urlsForUser()', () => {
  it('should return the urls that belong to the user (userRandomID)', () => {
    const id = 'userRandomID';
    const expectedOutput = {
      'b6UTxQ': testUrls.b6UTxQ,
      'i3BoGr': testUrls.i3BoGr,
    };
    assert.deepEqual(urlsForUser(id, testUrls), expectedOutput);
  });
  it('should return the urls that belong to the user (user2RandomID)', () => {
    const id = 'user2RandomID';
    const expectedOutput = {
      'i2BoGr': testUrls.i2BoGr,
    };
    assert.deepEqual(urlsForUser(id, testUrls), expectedOutput);
  });
  it('should return an empty object if there are no URLs for the given id', () => {
    const id = 'someUser';
    const expectedOutput = {};
    assert.deepEqual(urlsForUser(id, testUrls), expectedOutput);
  });
});