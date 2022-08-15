const express = require("express");
const cookieSession = require("cookie-session");
const methodOverride = require('method-override');
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
const {
  getUserByEmail,
  generateRandomString,
  findKeyByValue,
  checkPasswordByEmail,
  findIdByEmail,
  urlsForUser
} = require("./helpers");

/*tells the Express app to use EJS as its templating engine.*/
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'user_name',
  keys: ['key1','key2']
}));
app.use(express.urlencoded({ extended: true }));
//app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('_method'));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  }
};

app.get("/", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect(`/urls`);
  }
  if (!user) {
    res.redirect(`login`);
  }
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return res.status(403).send("You should login");
  }
  let urls = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = { urls,user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const urls = urlDatabase;
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect(`/login`);
  }
  const templateVars = { urls,user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let id = req.params.id;
  let user = users[req.session.user_id];
  // let a = req.session.total = req.session.total+1;
  // a++;
  if (!(id in urlDatabase)) {
    return res.status(403).send("This ID does not exist");
  }
  if (!user) {
    return res.status(403).send("You should login to manage your URLs");
  }
  if (user) {
    let urlsForCurrentUser = urlsForUser(user.id, urlDatabase);
    if (!(id in urlsForCurrentUser)) {
      return res.status(403).send("This shorten ID is not owned by you");
    }
  }
  const templateVars = {
    id: id,
    longURL: urlDatabase[id].longURL,
    user: user,
    //total: a
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  let id = req.params.id;
  if (!(id in urlDatabase)) {
    return res.status(403).send("Shortened url does not exist");
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const urls = urlDatabase;
  const user = users[req.session.user_id];
  let shortId = generateRandomString();
  if (!user) {
    return res.status(403).send("Please login");
  }
  if (!(Object.values(urls).includes(req.body.longURL))) {
    let objInsideUrlDatabase = {};
    objInsideUrlDatabase["longURL"] = req.body.longURL;
    objInsideUrlDatabase["userID"] = req.session.user_id;
    urlDatabase[shortId] = objInsideUrlDatabase;
    return res.redirect(`/urls/${shortId}`);
  }
  let existId = findKeyByValue(urlDatabase, req.body.longURL);
  res.redirect(`/urls/${existId}`);
});

app.put("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user = users[req.session.user_id];
  const urls =  urlsForUser(req.session.user_id, urlDatabase);
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

app.delete("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const user = users[req.session.user_id];
  const urls =  urlsForUser(req.session.user_id, urlDatabase);
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
  const user = users[req.session.user_id];
  if (user) {
    return res.redirect(`/urls`);
  }
  const templateVars = {urls, user};
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    return res.redirect(`urls`);
  }
  const templateVars = { user };
  res.render("urls_register", templateVars);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!getUserByEmail(email, users)) {
    return res.status(403).send("Email can not be found");
  }
  if (getUserByEmail(email, users)) {
    if (!checkPasswordByEmail(email, password, users)) {
      return res.status(403).send("Password is wrong");
    }
    let userId = findIdByEmail(email, users);
    req.session.user_id = userId;
    res.redirect(`/urls`);
  }
});

app.post("/register", (req, res) => {
  let randomId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  if (email.length === 0 || password.length === 0) {
    return res.status(400).send("Email and Password can not be empty");
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Email already registed");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userX = {
    id: randomId,
    email: email,
    password: hashedPassword
  };
  users[randomId] = userX;
  if (getUserByEmail(email, users)) {
    if (!checkPasswordByEmail(email, password, users)) {
      return res.status(403).send("Password is wrong");
    }
    let userId = findIdByEmail(email, users);
    req.session.user_id = userId;
    res.redirect(`/urls`);
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});
