const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const userRoute = require("./src/routes/user");
const txnRoute = require("./src/routes/transaction");
const db = require("./connect_db.js");
const app = express();
const port = process.env.PORT;
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
        url: "https://joinakoma.com",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
const specs = swaggerJsdoc(options);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
app.use("/api/user", userRoute);
app.use("/api/transaction", txnRoute);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
