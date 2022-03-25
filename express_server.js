const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
const res = require('express/lib/response');
const req = require('express/lib/request');
const { signedCookie } = require('cookie-parser');
const bcrypt = require('bcryptjs')
const cookieSession = require('cookie-session')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secret', 'middle', 'encrypt'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
//app.use(cookieParser());

// const urlDatabase = {
//   "b2xVn2":"http://www.lighthouselabs.ca",
//   "9sm5xK":"http://www.google.com",
// }

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'userRandomID'
},
  "9sm5xK": {
    longURL : "http://www.google.com",
    userID : 'userRandomID'
  }
}

const users ={
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("123",10)
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk",10)
  },

};
 
app.get('/', (req, res) => {
  res.send('hello!')
});




/// CREATE -------------------------------------
app.get("/urls/new", (req, res) => {  
  const templateVars = {
    users: users,
    cookies: req.session.user_id,
  };
  if (!req.session.user_id) {
    throw new Error('Need to Log in')

  } 
  res.render("urls_new", templateVars);
  
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    throw new Error('Need to Log in')
  } 
  const addLongURL = req.body.longURL;
  const addShortURL = generateRandomString();
  urlDatabase[addShortURL] = {userID: req.session.user_id, longURL:addLongURL};
  console.log('Item added ', urlDatabase);
  res.redirect(`/urls/${addShortURL}`);       
});

//READ -----------------------------------------
app.get("/urls", (req, res) => {
  const usersURL = {}
  for (const shorturl in urlDatabase) {
    if (urlDatabase[shorturl]['userID'] === req.session.user_id){
      usersURL[shorturl] = urlDatabase[shorturl].longURL
    }
  }
  const templateVars = { urls: usersURL,
    users: users,
    cookies: req.session.user_id,
   };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase.hasOwnProperty(req.params.shortURL)) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,
      cookies: req.session.user_id,
      users: users,
    }
      res.render("urls_show", templateVars);
      return;
  }
  res.send('404 Error. Page not found.')

});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log("Redirecting to" , longURL)
  res.redirect(longURL);
});


//DELETE------------------------------------------------
app.post('/urls/:shortURL/delete', (req, res) => { 
if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
  delete urlDatabase[req.params.shortURL];
  console.log('Item Deleted ',urlDatabase)
   res.redirect('/urls');
   return;
}

  res.status(401)
  res.send('Unauthorized')

 
});

//UPDATE ---------------------------------------------------
app.post('/urls/:shortURL', (req, res) => { 
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    const updateLongURL = req.body.newURL;
    urlDatabase[req.params.shortURL].longURL = updateLongURL;
    console.log('Item Updated ', urlDatabase)
    res.redirect('/urls')
    return;
  }
  res.status(401)
  res.send('Unauthorized')
  
});

// LOGIN ---------------------------------------------------
app.get('/login', (req, res) => {
  const templateVars = { urls: urlDatabase,
    users: users,
    cookies: req.session.user_id,
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
    if (values.includes(loginEmail) && bcrypt.compareSync(loginPassword, users[user].password)) {
      req.session.user_id = users[user].id
      res.redirect('/urls')
      return;
    }
  }
 
  res.status(403)
  res.send('incorrect pass')

})
// LOGOUT -------------------------------------------------
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls')
});

// REGISTER -------------------------------------------------
app.get("/register", (req, res) => {  
  const templateVars = {
    users: users,
    cookies: req.session.user_id
  };
  console.log('cookies' , req.session.user_id)
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const regEmail = req.body.email;
  const regPassword = bcrypt.hashSync(req.body.password,10);
  console.log(regPassword);

  if (emailChecker(regEmail)){
    res.status(400)
    res.send('ERROR USER ALRDY EXISTS or Empty')
    return;
  } else {
      users[userID] = {id:userID, email: regEmail, password: regPassword}
      req.session.user_id = userID 
      console.log('cookie from post ', req.session.user_id)
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

// Error Catch  ---------------------------------------------
app.use((err, req, res, next) => {
  console.log('eror handling middlewage')
  console.error(err)
  res.status(500).send(err.message)
})