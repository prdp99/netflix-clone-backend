const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const signup = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
  }
  if (existingUser) {
    return res.status(400).json({
      response: {
        status: 400,
        message: "user already exixts",
      },
    });
  } else {
    console.log(`before hasheing ${password}`);
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
    });
    try {
      await user.save();
    } catch (err) {
      console.log(err);
    }

    return res.status(201).json({
      response: {
        status: 201,
        message: "user created",
      },
    });
  }

  // return res.status(201).json({
  //   message: user,
  // });
};

const addToList = async (req, res, next) => {
  let movieExist = false;
  let tvExist = false;
  const { user, tvShows, movies } = req.body;
  const exisitingList = await User.findOne({
    email: user.email,
  });
  try {
    const exisitingList = await User.findOne({
      email: user.email,
    });
    function checkMovie() {
      console.log("checking if movie exist");
      return exisitingList.movies.map((data) => {
        if (data.title == movies.title) {
          console.log("data title", data.title);
          console.log("movies title", movies.title);
          movieExist = true;
        } else {
          movieExist = false;
        }
      });
    }
    function checkTv() {
      console.log("checking if tv exist");
      return exisitingList.tvShows.map((data) => {
        if (data.name == tvShows.title) {
          console.log("data title", data.title);
          console.log("tv title", movies.title);
          console.log("tv exist", movies.title);
          tvExist = true;
        } else {
          tvExist = false;
        }
      });
    }
    if (movies.title !== undefined) {
      checkMovie();
      if (movieExist) {
        console.log("Movie exist !!");
        console.log("Movieexist value", movieExist);
        await User.updateOne(
          { email: user.email },
          {
            $pull: {
              movies: {
                id: movies.id,
                title: movies.title,
                poster_path: movies.poster_path,
              },
            },
          }
        );
        return res.status(200).json({
          message: "succesfully removed movie",
        });
      } else {
        try {
          console.log("pushing movies");
          await User.updateOne(
            { email: user.email },
            {
              $push: {
                movies: {
                  id: movies.id,
                  title: movies.title,
                  poster_path: movies.poster_path,
                },
              },
            }
          );
          console.log("movie list added ");
          return res.status(201).json({
            message: "successfully added movies",
          });
        } catch (err) {
          console.log(err);
          console.log("cant update movie");
          return res.status(404).json({
            message: "Cannot update movie ",
          });
        }
      }
    }
    if (tvShows.title !== undefined) {
      checkTv();
      if (tvExist) {
        console.log("tv exist !!");
        console.log("tv value", tvExist);
        await User.updateOne(
          { email: user.email },
          {
            $pull: {
              tvShows: {
                id: tvShows.id,
                name: tvShows.title,
                poster_path: tvShows.poster_path,
              },
            },
          }
        );
        return res.status(200).json({
          message: "succesfully removed movie",
        });
      } else {
        try {
          console.log("pushing tv");
          await User.updateOne(
            { email: user.email },
            {
              $push: {
                tvShows: {
                  id: tvShows.id,
                  name: tvShows.title,
                  poster_path: tvShows.poster_path,
                },
              },
            }
          );
          console.log("tv list added ");
          return res.status(201).json({
            message: "successfully added tv",
          });
        } catch (err) {
          console.log(err);
          console.log("cant update tv");
          return res.status(404).json({
            message: "Cannot update tv ",
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
  }
  if (!existingUser) {
    return res.status(400).json({
      message: "user not found",
    });
  }
  const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({
      message: "invalid email or password",
    });
  }
  const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "35s",
  });
  console.log("generated token\n", token);

  if (req.cookies[`${existingUser._id}`]) {
    req.cookies[`${existingUser._id}`] = "";
  }

  res.cookie(String(existingUser._id), token, {
    path: "/",
    expires: new Date(Date.now() + 1000 * 30),
    httpOnly: true,
    sameSite: "lax",
  });

  return res.status(200).json({
    response: {
      status: 200,
      message: "suceesfully login",
    },
    user: existingUser,
    token,
  });
};
const verifyToken = (req, res, next) => {
  const cookies = req.headers.cookie;
  const token = cookies.split("=")[1];
  console.log(token);
  if (!token) {
    res.status(404).json({
      message: "no token found",
    });
  }
  jwt.verify(String(token), process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(400).json({
        message: "invaid token",
      });
    }
    console.log(user.id);
    req.id = user.id;
  });
  next();
};
const getUser = async (req, res, next) => {
  const userId = req.id;
  let user;
  try {
    user = await User.findById(userId, "-password");
  } catch (err) {
    return new Error(err);
  }
  if (!user) {
    return res.status(404).json({
      message: "user not found",
    });
  }
  return res.status(200).json({
    user,
  });
};
const refreshToken = (req, res, next) => {
  const cookies = req.headers.cookie;
  console.log(`getting cookie from backend ${cookies}`);
  const prevToken = cookies.split("=")[1];
  if (!prevToken) {
    return res.status(400).json({
      message: "Couldn't found token",
    });
  }
  jwt.verify(String(prevToken), process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({
        message: "Authorization failed",
      });
    }
    res.clearCookie(`${user.id}`);
    req.cookies[`${user.id}`] = "";

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "35s",
    });

    console.log("Regerated token\n", token);
    res.cookie(String(user.id), token, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 30),
      httpOnly: true,
      sameSite: "lax",
    });

    req.id = user.id;
    next();
  });
};

const logout = (req, res, next) => {
  const cookies = req.headers.cookie;
  console.log(`getting cookie from backend ${cookies}`);
  const prevToken = cookies.split("=")[1];
  if (!prevToken) {
    return res.status(400).json({
      message: "Couldn't found token",
    });
  }
  jwt.verify(String(prevToken), process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({
        message: "Authorization failed",
      });
    }
    res.clearCookie(`${user.id}`);
    req.cookies[`${user.id}`] = "";

    return res.status(200).json({
      message: "succesfully logged out",
    });
  });
};

exports.signup = signup;
exports.logout = logout;
exports.addToList = addToList;
exports.login = login;
exports.verifyToken = verifyToken;
exports.getUser = getUser;
exports.refreshToken = refreshToken;
