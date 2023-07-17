const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { verifyToken } = require("../helper/verify-token");

exports.register = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username: username })
    .then((user) => {
      if (user) {
        const error = new Error("User already exist");
        error.statuscode = 409;
        throw error;
      }
      bcrypt
        .hash(password, 12)
        .then((hashedPass) => {
          const user = new User({
            username: username,
            password: hashedPass,
          });
          return user.save();
        })
        .then((user) => {
          const token = jwt.sign(
            {
              username: user.username,
              userId: user._id.toString(),
            },
            process.env.JWT_SCERET, 
            { expiresIn: "1h" }
          );
          res.cookie("access_token", token, {
            sameSite: "none",
            secure: true,
            httpOnly: true,
            maxAge: 1000 * 60 * 60, // 1 hour in milliseconds
          });
          res
            .status(201)
            .json({ message: "User Created Successfully", userId: user._id });
        });
    })
    .catch((err) => {
      if (!err.statuscode) {
        err.statuscode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  let loadedUser;

  User.findOne({ username })
    .then((user) => {
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong Credentials");
        error.statusCode = 401;
        throw error;
      }

      const token = jwt.sign(
        {
          username: loadedUser.username,
          userId: loadedUser._id.toString(),
        },
        process.env.JWT_SCERET, // Replace with your JWT secret
        { expiresIn: "1h" }
      );

      res.cookie("access_token", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60, // 1 hour in milliseconds
      });

      res.status(200).json({ token, userId: loadedUser._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.logout = (req, res, next) => {
  res.cookie("access_token", "", {sameSite:'none', secure: true}).status(200).json(" User logged out");
};

exports.getProfile = async (req, res, next) => {
  try {
    const userData = await verifyToken(req);

    if (userData) {
      res.status(200).json(userData);
    } else {
      res.status(401).json({ message: "No token" });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  const users = await User.find({}, { _id: 1, username: 1 });

  res.status(200).json(users);
};
