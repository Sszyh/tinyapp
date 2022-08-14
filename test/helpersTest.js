const { assert } = require('chai');
const { getUserByEmail } = require('../helpers');
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

describe('getUserByEmail',() => {
  it('shoule return a true if email is valid', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    assert.strictEqual(user, true);
  });
  it('should return false if emial is not in our users database', () => {
    const user = getUserByEmail('x@x',testUsers);
    assert.strictEqual(user, false);
  })
})