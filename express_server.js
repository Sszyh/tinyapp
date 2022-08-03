const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
  console.log("urldatabase in new",urlDatabase);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};//not sure for longURL
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortId = generateRandomString();
  
  if (!Object.values(urlDatabase).includes(req.body.longURL)) {
    console.log("were");
    urlDatabase[shortId] = req.body.longURL;
    res.redirect(`/urls/${shortId}`);
  } else {
    let existId = findKeyByValue(urlDatabase, req.body.longURL);
    res.redirect(`/urls/${existId}`);
  }
  
});

app.get("/u/:id", (req, res) => {
  const longURL = req.body;
  res.redirect(longURL);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});