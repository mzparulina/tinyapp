const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const {
  getLongURL,
  getUser,
  getUserByEmail,
  urlsForUser,
  generateRandomString,
  isUserUrl,
  isValidUrl,
} = require('./helpers');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
};

const userIdCookie = 'user_id';
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['lhl', 'pmr', 'nov14'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use((req, res, next) => {
  const user = getUser(req.session[userIdCookie], users);
  if (user) {
    req.user = user;
  }
  next();
});

app.get("/", (req, res) => {
  res.redirect('/login');
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//==============================
// Register
//==============================
// === POST /register ===
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    res.sendStatus(400);
  } else if (getUserByEmail(email), users) {
    res.status(400).send('Email registered');
  } else {
    const user = {
      id: generateRandomString(6),
      email: email,
      password: bcrypt.hashSync(password, 10),
    };
    users[user.id] = user;
    req.session[userIdCookie] = user.id;
    res.redirect('/urls');
  }
});
// === GET /register ===
app.get("/register", (req, res) => {
  const user = req.user;
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: user,
    };
    res.render('urls_register', templateVars);
  }
});

//==============================
// Login and Logut
//==============================

// === POST /login ===
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session[userIdCookie] = user.id;
    res.redirect('/urls');
  } else {
    res.status(403).send('Invalid login');
  }
});
// === GET /login ===
app.get("/login", (req, res) => {
  const user = req.user;
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: user,
    };

    res.render('urls_login', templateVars);
  }
});
// === POST /logout ===
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//==============================
// URLS
//==============================

// === CREATE /urls ===
app.post("/urls", (req, res) => {
  const user = req.user;
  const longURL = req.body.longURL;

  if (user) {
    if (!getLongURL(longURL, urlDatabase)) {
      const newUrls = {
        id: generateRandomString(8),
        longURL: longURL,
        userID: user.id
      };
      urlDatabase[newUrls.id] = newUrls;
      res.redirect('/urls');
    } else {
      res.status(403).send('Url exists');
    }
  } else {
    res.status(403).send('You need to login');
  }
});
// === UPDATE /urls/:shorturl ===
app.put("/urls/:id", (req, res) => {
  const user = req.user;
  const url = req.params.id;
  const longURL = req.body.longURL;

  if (user) {
    if (!isUserUrl(url, user, urlDatabase)) {
      if (!getLongURL(longURL, urlDatabase)) {
        urlDatabase[url] =  {
          longURL: longURL,
          userID: user.id,
        };
        const templateVars = {
          urls: urlsForUser(user.id, urlDatabase),
          user: user,
        };
        
        res.render('urls_index', templateVars);
      } else {
        res.status(404).send('URL Exists');
      }
    } else {
      res.status(403).send('URL Does not Exist');
    }
  } else {
    res.status(403).send('Please Login');
  }
});
// === DELETE /urls/shorturl ===
app.delete("/urls/:id", (req, res) => {
  const user = req.user;
  if (user) {
    if (urlDatabase[req.params.id]) {
      delete urlDatabase[req.params.id];
      res.redirect('/urls');
    } else {
      res.status(403).send('URL Does not Exist');
    }
  } else {
    res.redirect('/login');
  }
});
// === GET /urls ===
app.get("/urls", (req, res) => {
  const user = req.user;
  if (user) {
    const templateVars = {
      urls: urlsForUser(user.id, urlDatabase),
      user: user,
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect('/login');
  }
});
// === GET /urls/new ===
app.get("/urls/new", (req, res) => {
  const user = req.user;
  if (!user) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user: user,
    };
    res.render("urls_new", templateVars);
  }
});
// === GET /urls/shorturl ===
app.get("/urls/:id", (req, res) => {
  const user = req.user;
  const url = req.params.id;
  if (user) {
    if (!isValidUrl(url, urlDatabase)) {
      res.status(400).send('Invalid URL.');
    } else if (isUserUrl(url, user, urlDatabase)) {
      res.sendStatus(403);
    } else {
      const templateVars = {
        id: req.params.id,
        longURL:urlDatabase[url].longURL,
        user: user
      };
      res.render("urls_show", templateVars);
    }
  } else {
    res.status(404).send('Url does not exist');
  }
});
// === GET /u/shorturl ===
app.get("/u/:id", (req, res) => {
  const url = urlDatabase[req.params.id];
  if (url) {
    res.redirect(url);
  } else {
    res.status(404).send('Url does not exist');
  }
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});