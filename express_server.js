const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

//tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs");
app.use(cookieParser());

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

function generateRandomString() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  };
  return result;
};

const findKeyByValue = function(object, value) {
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

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.get("/urls", (req, res) => {//app.get is a route hanlder
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);//use res.render() to pass the URL data to our template
/*EJS automatically knows to look inside the views directory for any template files that have the extension .ejs. 
This means we don't need to tell it where to find them. 
It also means that we do not need to include the extension of the filename when referencing it.*/
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
  //console.log("urldatabase in new",urlDatabase);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortId = generateRandomString();
  if (!Object.values(urlDatabase).includes(req.body.longURL)) {
    urlDatabase[shortId] = req.body.longURL;
    res.redirect(`/urls/${shortId}`);
  } else {
    let existId = findKeyByValue(urlDatabase, req.body.longURL);
    res.redirect(`/urls/${existId}`);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie("username", username);
  // delete all things adding here, the templateVar should be in app.get of all other pages.
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(`/urls`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  let randomId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  const userX = {
    id: randomId,
    email: email,
    password: password
  };
  users[randomId] = userX;
  res.cookie("user_id", randomId);
  res.redirect(`/urls`);
});