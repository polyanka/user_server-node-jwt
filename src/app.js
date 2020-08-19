const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const users = require('./users');

const HOST = 'localhost';
const PORT = 7000;
const TOKEN = '1a2b-3c4d-5e6f-7g8h';

const app = express();

app.use(bodyParser.json());

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.post('/signIn', (req, res) => {
  const { login, password } = req.body;

  const user = users.find(
    (user) => user.login == login && user.password == password
  );

  if (user) {
    return res.status(200).json({
      login,
      token: jwt.sign({ id: user.id }, TOKEN),
    });
  }

  return res.status(404).json({ message: 'User not found' });
});

app.listen(PORT, HOST, () =>
  console.log(`Server listens http://${HOST}:${PORT}`)
);
