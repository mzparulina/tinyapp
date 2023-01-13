const express = require("express");
// const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

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

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['lhl', 'pmr', 'nov14'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use((req, res, next) => {
  const user = getUserDetails(req.session[userIdCookie]);
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
      password: bcrypt.hashSync(password, 10),
    };

    users[user.id] = user;
    req.session[userIdCookie] = user.id;
    res.redirect('/urls');
  }
});

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

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserEmail(email);
  if (user && bcrypt.compareSync(password, user.password)) {
    console.log('login');
    req.session[userIdCookie] = user.id;
    res.redirect('/urls');
  } else {
    res.status(403).send('Invalid login');
  }
});

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

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//==============================
// URLS
//==============================
app.post("/urls", (req, res) => {
  const user = req.user;
  if (user) {
    const newUrls = {
      id: generateRandomString(8),
      longURL: req.body.longURL,
      userID: user.id
    };
    urlDatabase[newUrls.id] = newUrls;
    res.redirect('/urls');
  } else {
    res.status(403).send('You need to login');
  }
});

app.get("/urls", (req, res) => {
  const user = req.user;
  if (user) {
    const templateVars = {
      urls: urlsForUser(user.id),
      user: user,
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.post("/urls/:id", (req, res) => {
  const user = req.user;
  if (user) {
    if (urlDatabase[req.params.id]) {
      urlDatabase[req.params.id].longURL = req.body.longURL;
      res.redirect('/urls');
    } else {
      res.status(403).send('URL Does not Exist');
    }
  } else {
    res.status(403).send('Please Login');
  }
});

app.post("/urls/:id/delete", (req, res) => {
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

app.get("/urls/:id", (req, res) => {
  const user = req.user;
  if (user) {
    const templateVars = {
      id: req.params.id,
      longURL:urlDatabase[req.params.id].longURL,
      user: user
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send('Url does not exist');
  }
});

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

const generateRandomString = (len) => {
  return Math.random().toString(36).substring(2, len);
};

const getUserDetails = (id) => {
  return users[id];
};

const getUserEmail = (val) => {
  return valueFinder(users, 'email', val);
};

const urlsForUser = (val) => {
  const userUrls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === val) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
};

const valueFinder = (obj, key, val) => {
  let foundObj;
  JSON.stringify(obj, (_, nestedValue) => {
    if (nestedValue && nestedValue[key] === val) {
      foundObj = nestedValue;
    }
    return nestedValue;
  });
  return foundObj;
};