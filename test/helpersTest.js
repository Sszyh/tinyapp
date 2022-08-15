const { assert } = require('chai');
const { getUserByEmail, findKeyByValue, findIdByEmail } = require('../helpers');
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

describe('#getUserByEmail', () => {
  it('shoule return a true if email is valid', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    assert.strictEqual(user, true);
  });
  it('should return false if emial is not in our users database', () => {
    const user = getUserByEmail('x@x', testUsers);
    assert.strictEqual(user, false);
  });
});

describe("#findKeyByValue", () => {
  it("return 'drama' for 'The Wire'", () => {
    const bestTVShowsByGenre = {
      sci_fi: "The Expanse",
      comedy: "Brooklyn Nine-Nine",
      drama: "The Wire"
    };
    assert.deepEqual(findKeyByValue(bestTVShowsByGenre, "The Wire"), "drama");
  });

  it("return 'undefined' for 'That '70s Show'", () => {
    const bestTVShowsByGenre = {
      sci_fi: "The Expanse",
      comedy: "Brooklyn Nine-Nine",
      drama: "The Wire"
    };
    assert.deepEqual(findKeyByValue(bestTVShowsByGenre, "That '70s Show"), undefined);
  });
});

describe('#findIdByEmail', () => {
  it('shoule return a userID by email', () => {
    const users = {
      userRandomID: {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur",
      }
    };
    assert.strictEqual(findIdByEmail("user@example.com", users), "userRandomID");
  });
  it('shoule return empty if email is not existed', () => {
    const users = {
      userRandomID: {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur",
      }
    };
    assert.strictEqual(findIdByEmail("2@2", users), "");
  });
});