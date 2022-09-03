const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/user-routes");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());
app.use("/api", router);
app.get("/", (req, res) => {
  res.send("running");
})
const port = process.env.PORT || 5000;
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.jyo3d.mongodb.net/brandnewtable?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(port);
    console.log("databes connected");
  });

process.on("uncaughtException", function (err) {
  console.error(err);
  console.log("Node NOT Exiting...");
});
