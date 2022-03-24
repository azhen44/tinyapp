const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
const res = require('express/lib/response');
const req = require('express/lib/request');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

const users ={
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },

};
 
app.get('/', (req, res) => {
  res.send('hello!')
});




/// CREATE -------------------------------------
app.get("/urls/new", (req, res) => {  
  const templateVars = {
    //users: req.cookies["username"],
    users: users,
    cookies: req.cookies,
    // ... any other vars
  };
  'TESTING'
  res.render("urls_new", templateVars);
  
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
  const templateVars = { urls: urlDatabase,
    users: users,
    cookies: req.cookies,
   };
  //console.log(templateVars)
  //console.log('users', users)
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
  cookies: req.cookies,
  //username: req.cookies["username"],
  users: users,
}
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
  //console.log(templateVars);
  delete urlDatabase[req.params.shortURL];
  console.log('Item Deleted ',urlDatabase)
  console.log(req.cookies)
  res.redirect('/urls');
});

//UPDATE ---------------------------------------------------
app.post('/urls/:shortURL', (req, res) => { 
  const updateLongURL = req.body.newURL;
  console.log(updateLongURL)
  urlDatabase[req.params.shortURL] = updateLongURL;
  console.log('Item Updated ', urlDatabase)
  console.log(req.cookies)
  res.redirect('/urls')
  
});

// LOGIN ---------------------------------------------------
app.get('/login', (req, res) => {
  const templateVars = { urls: urlDatabase,
    users: users,
    cookies: req.cookies,
   };
  res.render('urls_login', templateVars)
})


app.post('/login', (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;

  if(!loginEmail){
    res.status(403)
    res.send('Empty login')
    return;
  }
  if(!emailChecker(loginEmail)) {
    res.status(403)
    res.send('No registered email.')
    return;
  }

  for (const user in users) {
    values = Object.values(users[user])
    if (values.includes(loginEmail) && users[user].password === loginPassword) {
      res.cookie('user_id', users[user].id)
      res.redirect('/urls')
      return;
    }
  }
 
  res.status(403)
  res.send('incorrect pass')

})
// LOGOUT -------------------------------------------------
app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls')
});

// REGISTER -------------------------------------------------
app.get("/register", (req, res) => {  
  const templateVars = {
    //username: req.cookies["username"],
    users: users,
    cookies: req.cookies
  };
  console.log('cookies' , req.cookies)
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const regEmail = req.body.email;
  const regPassword = req.body.password;

  if (emailChecker(regEmail)){
    res.status(400)
    res.send('ERROR USER ALRDY EXISTS or Empty')
    return;
  } else {
      users[userID] = {id:userID, email: regEmail, password: regPassword}
      res.cookie('user_id', userID)
      console.log(users)
      res.redirect('/urls')
      return;
    }
  
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

// Email Checker -------------------------------------------------
function emailChecker (email) {
  if (!email) {
    return true;
  }
  for (const user in users) {
    if (email === users[user]['email']) {
      return true;
    }
  }
  return false
};

