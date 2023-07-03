const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

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

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Akoma Express API with Swagger",
      version: "0.1.0",
      description: "This is the Akoma API spec",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const specs = swaggerJsdoc(options);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
