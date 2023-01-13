const express = require("express");
const cookieParser = require('cookie-parser')

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const userIdCookie = 'user_id';

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  const user = getUserDetails(req.cookies[userIdCookie]);
  if (user) {
    req.user = user;
  }
  next();
});

//==============================
// POST METHODS
//==============================

app.post("/register", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '') {
    res.sendStatus(400);
  } else if (getUserEmail(email)) {
    res.status(400).send('Email registered');
  } else {
    const user = {
      id: generateRandomString(6),
      email: email,
      password: password,
    };

    users[user.id] = user;
    res.cookie(userIdCookie, user.id);
    res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserEmail(email);
  if (user && user.password === password) {
    console.log('login');
    res.cookie(userIdCookie, user.id);
    res.redirect('/urls');
  } else {
    res.status(403).send('Invalid login');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie(userIdCookie);
  delete users[userIdCookie];
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const newUrls = { id: generateRandomString(8), longURL: req.body.longURL };
  urlDatabase[newUrls.id] = newUrls.longURL;
  res.redirect('/urls/' + newUrls.id);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//==============================
// GET METHODS
//==============================
app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  const user = req.user;
  const templateVars = {
    urls: urlDatabase,
    user: user,
  };

  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/register", (req, res) => {
  const user = req.user;
  const templateVars = {
    user: user,
  };
  res.render('urls_register', templateVars);
});

app.get("/login", (req, res) => {
  const user = req.user;
  const templateVars = {
    user: user,
  };

  res.render('urls_login', templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const user = req.user;

  const templateVars = {
    user: user,
  };

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = req.user;
  const templateVars = {
    id: req.params.id,
    longURL:urlDatabase[req.params.id],
    user: user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});

const generateRandomString = (len) => {
  return Math.random().toString(36).substring(2, len);
};

const getUserDetails = (id) => {
  return users[id];
};

const getUserEmail = (val) => {
  let foundObj;
  JSON.stringify(users, (_, nestedValue) => {
    if (nestedValue && nestedValue['email'] === val) {
      foundObj = nestedValue;
    }
    return nestedValue;
  });
  return foundObj;
};