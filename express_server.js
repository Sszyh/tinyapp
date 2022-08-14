const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
/*tells the Express app to use EJS as its templating engine.*/
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
}
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  }
};

function generateRandomString() {
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
/*function to check if email already exist */
const getUserByEmail = function (email) {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
}
/*function to check if password correct */
const checkPasswordByEmail = function (email, password) {
  for (let user in users) {
    if (users[user].email === email) {
      let hashedPassword = users[user].password;
      return bcrypt.compareSync(password, hashedPassword);
    }
  }
  return false;
}
/*function to provide user's id by email */
const findIdByEmail = function (email) {
  let output = "";
  for (let user in users) {
    if (users[user].email === email) {
      output = user;
    }
  }
  return output;
}
/*function to return the URLs where the userID 
is equal to the id of the currently loggined user */
const urlsForUser = function (idOfCurrentUser) {
  let output = {};
  for (let id in urlDatabase) {
    if (urlDatabase[id].userID === idOfCurrentUser) {
      output[id] = urlDatabase[id].longURL;
    }
  }
  return output;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  if (!user) {
    return res.status(403).send("You should login");
  }
  let urls = urlsForUser(req.cookies["user_id"]);
  const templateVars = { urls,user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const urls = urlDatabase;
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.redirect(`/login`);
  }
  const templateVars = { urls,user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(403).send("You should login");
  } 
  let id = req.params.id;
  const templateVars = {
    id: id,
    longURL: urlDatabase[id].longURL,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  let id = req.params.id;
  if (!(id in urlDatabase)) {
    return res.status(403).send("Shortened url does not exist")
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const urls = urlDatabase;
  const user = users[req.cookies["user_id"]];
  let shortId = generateRandomString();
  if (!user) {
    return res.status(403).send("Please login");
  };
  if (!(Object.values(urls).includes(req.body.longURL))) {
    let objInsideUrlDatabase = {};
    objInsideUrlDatabase["longURL"] = req.body.longURL;
    objInsideUrlDatabase["userID"] = req.cookies["user_id"];
    urlDatabase[shortId] = objInsideUrlDatabase;
    return res.redirect(`/urls/${shortId}`);
  }
  let existId = findKeyByValue(urlDatabase, req.body.longURL);
  res.redirect(`/urls/${existId}`);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user = users[req.cookies["user_id"]];
  const urls =  urlsForUser(req.cookies["user_id"]);
  if (!id) {
    return res.status(403).send("Id does not exist-(curl)");
  }
  if (!user) {
    return res.status(403).send("User is not logged in-(curl)");
  }
  if (!(id in urls)) {
    return res.status(403).send("User does not own the URL-(curl)");
  }
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const user = users[req.cookies["user_id"]];
  const urls =  urlsForUser(req.cookies["user_id"]);
  if (!id) {
    return res.status(403).send("Id does not exist-(curl)");
  }
  if (!user) {
    return res.status(403).send("User is not logged in-(curl)");
  }
  if (!(id in urls)) {
    return res.status(403).send("User does not own the URL-(curl)");
  }
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  const urls = urlDatabase;
  const user = users[req.cookies["user_id"]];
  if (user) {
    return res.redirect(`/urls`);
  }
  const templateVars = {urls, user};
  res.render("urls_login", templateVars)
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    return res.redirect(`urls`);
  }
  const templateVars = { user };
  res.render("urls_register", templateVars);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!getUserByEmail(email)) {
    return res.status(403).send("Email can not be found");
  }
  if (getUserByEmail(email)) {
    if (!checkPasswordByEmail(email, password)) {
      return res.status(403).send("Password is wrong");
    } 
    let userId = findIdByEmail(email);
    res.cookie("user_id", userId);
    res.redirect(`/urls`);
  }
});

app.post("/register", (req, res) => {
  let randomId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  if (email.length === 0 || password.length === 0) {
    return res.status(400).send("input can not be empty");
  } 
  if (getUserByEmail(email)) {
    return res.status(400).send("Email already registed");
  } 
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userX = {
    id: randomId,
    email: email,
    password: hashedPassword
  };
  users[randomId] = userX;
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});
