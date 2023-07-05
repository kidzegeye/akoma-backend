const express = require("express");
const { body, header, validationResult } = require("express-validator");
const txn_controller = require("../repo/transactionRepo.js");
const router = express.Router();

router.post(
  "/get",
  body("username").trim().notEmpty(),
  header("authorization").trim().notEmpty(),
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const sessionToken = req.headers.authorization.split(" ")[1];
      rows = await txn_controller.getAll(req.body, sessionToken);
      res.status(rows.code).send(rows.response);
    } else {
      res.send({ errors: result.array() });
    }
  }
);

router.post(
  "/get-one",
  body("username").trim().notEmpty(),
  header("authorization").trim().notEmpty(),
  body("tid").trim().notEmpty(),
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const sessionToken = req.headers.authorization.split(" ")[1];
      rows = await txn_controller.getOne(
        req.body.username,
        sessionToken,
        req.body.tid
      );
      res.status(rows.code).send(rows.response);
    } else {
      res.send({ errors: result.array() });
    }
  }
);

router.post(
  "/",
  body("username").trim().notEmpty(),
  header("authorization").trim().notEmpty(),
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const sessionToken = req.headers.authorization.split(" ")[1];
      rows = await txn_controller.create(sessionToken, req.body);
      res.status(rows.code).send(rows.response);
    } else {
      res.send({ errors: result.array() });
    }
  }
);

router.put(
  "/",
  body("username").trim().notEmpty(),
  body("tid").trim().notEmpty(),
  header("authorization").trim().notEmpty(),
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const sessionToken = req.headers.authorization.split(" ")[1];
      rows = await txn_controller.edit(sessionToken, req.body);
      res.status(rows.code).send(rows.response);
    } else {
      res.send({ errors: result.array() });
    }
  }
);

module.exports = router;
