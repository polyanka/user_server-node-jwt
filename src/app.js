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

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[0];
  if (!token) {
    return res.status(400).send('Invalid token');
  }

  jwt.verify(authHeader, TOKEN, (err, user) => {
    if (err) {
      return res.status(400).send({
        success: false,
        message: 'Invalid token',
      });
    }
    req.user = user;
    next();
  });
}

app.post('/signIn', (req, res) => {
  const { login, password } = req.body;

  const user = users.find(
    (user) => user.login == login && user.password == password
  );

  if (user) {
    return res.status(200).json({
      login,
      success: true,
      message: 'Login successful!',
      token: jwt.sign({ id: user.id }, TOKEN),
    });
  }

  return res.status(404).json({
    success: false,
    message: 'User not found',
  });
});

app.post('/signUp', (req, res) => {
  const { login, password } = req.body;
  const isRegistered = users.some((user) => user.login == login);

  if (isRegistered) {
    res.status(400).json({
      success: false,
      message: 'Login is not available!',
    });

    return;
  }

  if (login.length < 3) {
    res.status(400).json({
      success: false,
      message: 'Login is too short (minimum is 3 characters)',
    });

    return;
  }

  if (password.length < 8) {
    res.status(400).json({
      success: false,
      message: 'Password is too short (minimum is 8 characters)',
    });

    return;
  }

  const id = users.length + 1;
  users.push({
    id,
    login,
    password,
    avatar: `https://picsum.photos/id/${id}/400/400?grayscale`,
  });

  res.status(200).json({
    success: true,
    message: 'User registered successfully!',
  });
});

app.get('/profile', authenticateToken, (req, res) => {
  const { id } = req.user;
  const user = users.find((user) => user.id == id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const { password, ...userData } = user;

  return res.status(200).json({
    user: userData,
  });
});

app.put('/profile', authenticateToken, (req, res) => {
  const { id } = req.user;
  const { about, name, location } = req.body;

  const index = users.findIndex((user) => user.id === id);

  if (index < 0) {
    res.status(400).json({
      success: false,
      message: 'User not found',
    });

    return;
  }

  users[index] = { ...users[0], about, name, location };
  const { password, ...userData } = users[index];

  res.status(200).json({
    user: userData,
    success: true,
    message: 'Profile updated successfully!',
  });
});

app.listen(PORT, HOST, () =>
  console.log(`Server listens http://${HOST}:${PORT}`)
);
