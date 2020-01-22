const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");

const TEST_USERS = [
  {
    id: "u1",
    name: "Test",
    email: "test@test.com",
    password: "testers"
  }
];

const getUsers = (req, res, next) => {
  res.status(200).json({
    users: TEST_USERS
  });
};

const signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs, please check your data", 422);
  }

  const { name, email, password } = req.body;

  const hasUser = TEST_USERS.find(u => u.email === email);
  if (hasUser) {
    throw new HttpError("Could not create user, email already exists", 422);
  }

  const createdUser = {
    id: uuid(),
    name: name,
    email: email,
    password: password
  };

  TEST_USERS.push(createdUser);

  res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = TEST_USERS.find(u => u.email === email);

  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError(
      "Could not identify user, no such user or incorrect password",
      401
    );
  }

  res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
