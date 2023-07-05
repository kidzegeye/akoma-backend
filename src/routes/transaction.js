const express = require("express");
const { body, validationResult } = require("express-validator");
const txn_controller = require("../repo/transactionRepo.js");
const router = express.Router();

router.get("/:uid", async (req, res) => {
  rows = await txn_controller.getAll(uid);
  res.status(rows.code).send(rows.response);
});

router.get("/:uid/:tid", async (req, res) => {
  rows = await txn_controller.getOne(uid, tid);
  res.status(rows.code).send(rows.response);
});

router.post("/", async (req, res) => {
  rows = await txn_controller.create();
  res.status(rows.code).send(rows.response);
});
