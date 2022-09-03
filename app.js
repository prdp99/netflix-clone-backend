const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/user-routes");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const app = express();

app.use(cors({ credentials: true, origin: process.env.ORIGIN }));
app.use(cookieParser());
app.use(express.json());
app.use("/api", router);
app.get("/", (req, res) => {
  res.send("it's running");
});
const port = process.env.PORT || 5000;
if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "staging"
) {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/client/build/index.html"));
  });
}
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.jyo3d.mongodb.net/brandnewtable?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(port);
    console.log("databes connected", port);
    console.log("databes connected", process.env.ORIGIN);
  });

process.on("uncaughtException", function (err) {
  console.error(err);
  console.log("Node NOT Exiting...");
});
