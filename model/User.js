const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "please provide email"],
  },

  password: {
    type: String,
    required: [true, "please provide password"],
    minlength: 6,
  },
  tvShows: [
    {
      id: {
        type: String,
      },
      name: {
        type: String,
      },
      poster_path: {
        type: String,
      },
    },
  ],
  movies: [
    {
      id: {
        type: String,
      },
      title: {
        type: String,
      },
      poster_path: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
