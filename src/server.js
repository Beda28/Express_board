const express = require("express");
const path = require("path");
const session = require("express-session")

const app = express();
const port = 3000;

const route = require('./route/route');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'adminroot',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 30
  }
}))

app.use('/', route);

app.use(express.static(path.join(__dirname, "public")));

app.listen(port, '0.0.0.0', () => {
  console.log(`서버가 http://localhost:${port} 에서 실행중입니다.`);
});
