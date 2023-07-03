const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const userRoute = require("./src/routes/user");

const db = require("./connect_db.js");

const app = express();

const port = process.env.PORT;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/api/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/user", userRoute);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
