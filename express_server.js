const express = require('express');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
const res = require('express/lib/response');
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}
 
app.get('/', (req, res) => {
  res.send('hello!')
});

/// CREATE -------------------------------------
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const addLongURL = req.body.longURL;
  const addShortURL = generateRandomString();
  urlDatabase[addShortURL] = addLongURL;
  console.log('Item added ', urlDatabase);
  res.redirect(`/urls/${addShortURL}`);       
});

//READ -----------------------------------------
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  //console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log("Redirecting to" , longURL)
  res.redirect(longURL);
});

// app.get("/url_show", (req, res) => {
//   const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
//   res.render("urls_show", templateVars);
// });

//DELETE------------------------------------------------
app.post('/urls/:shortURL/delete', (req, res) => { 
  const templateVars = { shortURL: req.params.shortURL}
  //console.log(templateVars);
  delete urlDatabase[req.params.shortURL];
  console.log('Item Deleted ',urlDatabase)
  res.redirect('/urls');
});

//UPDATE ---------------------------------------------------
app.post('/urls/:shortURL', (req, res) => { 
  const updateLongURL = req.body.newURL;
  console.log(updateLongURL)
  urlDatabase[req.params.shortURL] = updateLongURL;
  console.log('Item Updated ', urlDatabase)
  res.redirect('/urls')
});






// LISTENING -----------------------------------------
app.listen(PORT, () => {
  console.log(`example app listening on port ${PORT}`)
});

// GENERATE RANDOM STRING -------------------------------
function generateRandomString() {
  let result = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 6; i ++) {
    randomChar = char.charAt(Math.floor(Math.random() * char.length))
    result += randomChar;
  }
  return result;
}

