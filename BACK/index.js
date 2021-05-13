
require('dotenv').config();
const http = require('http');
const bcrypt = require("bcryptjs");
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const es6Renderer = require('express-es6-template-engine');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const app = express();
const logger = morgan('tiny');
const hostname = '0.0.0.0';
const PORT = "5000";

//Register Middleware
app.use(logger);
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
// disabling for local development
// app.use(helmet());


const { requireLogin } = require("./auth");

// requireLogin() is a mini-middleware function
// that runs before our (req, res) => {} handler
// app.get('/members-only', requireLogin,(req, res) => {
app.get("/members-only", (req, res) => {
    console.log("------ in members only area -------");
    console.log(req.session.user);
    const { username } = req.session.user;
    res.send(`
      
      <h1>Hi ${username}!</h1>
      <a href="/todos">View Todo list</a>
      <br>
      <a href="/users/logout">Log out</a>
          `);
});

app.get("/unauthorized", (req, res) => {
    console.log("----- so sad...not logged in ----");
    res.send(`You shall not pass!`);
});

//authentication
const password = "super-secret-password";
const salt = bcrypt.genSaltSync(10);
console.log(salt);

const hashedPassword = bcrypt.hashSync(password, salt);
console.log(hashedPassword);

//===========================


app.use(session({
    store: new FileStore(),  // no options for now
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: true,
    rolling: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.engine('html', es6Renderer);
app.set('views', 'templates');
app.set('view engine', 'html');

const server = http.createServer(app);
app.get('/', (req, res) => {
    res.send('Your app is running. Start building!')
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

server.listen(PORT, hostname, () => {
    console.log(`Server running at localhost, port: ${PORT}`);
});

