const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");

const userRoute = require("./src/routes/user");
const txnRoute = require("./src/routes/transaction");
const db = require("./connect_db.js");
const app = express();
const port = process.env.PORT;
const swaggerOptions = {
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
const whitelist = [`localhost:${port}`, `https://joinakoma.com`];
const corsOptions = {
  origin: function (origin, callback) {
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
const specs = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
app.use("/api/user", userRoute);
app.use("/api/transaction", txnRoute);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
