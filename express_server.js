const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

/*tells the Express app to use EJS as its templating engine.*/
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

/*function to check if email already exist */
const getUserByEmail = function(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
}

const checkPasswordByEmail = function(email, password) {
  for (let user in users) {
    if (users[user].email === email) {
      if (users[user].password === password) {
        return true;
      }
    }
  }
  return false;
}

const findIdByEmail = function(email) {
  let output = "";
  for (let user in users) {
    if (users[user].email === email) {
      output = user;
    }
  }
  return output;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls", (req, res) => {//app.get is a route hanlder
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  console.log("cookies inside get urls:",[req.cookies["user_id"]]);
  res.render("urls_index", templateVars);
/*use res.render() to pass the URL data to our template.*/
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

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
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

app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  console.log("cookies inside get login:",[req.cookies["user_id"]]);
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
  };
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
    } else {
      let userId = findIdByEmail(email);
      console.log("userId",userId)
      res.cookie("user_id", userId);
      console.log("userbefore:", users);
      res.redirect(`/urls`);
    }
  }
  
  // let username = req.body.username;
  // res.cookie("user_id", username);
  // // delete all things adding here, the templateVar should be in app.get of all other pages.
  // res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  let randomId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  //
  console.log("userbefore:", users);
  if (email.length === 0 || password.length === 0 ) {
    res.status(400).send("input can not be empty");
  } else if (getUserByEmail(email)) {
    res.status(400).send("Email already registed");
  } else {
    const userX = {
      id: randomId,
      email: email,
      password: password
    };
    users[randomId] = userX;
    //res.cookie("user_id", randomId);
    console.log("userafter:", users);
    res.redirect(`/urls`);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});
