const express = require("express");
const { body, validationResult } = require("express-validator");
const txn_controller = require("../repo/transactionRepo.js");
const router = express.Router();

router.get("/", async (req, res) => {
  rows = await txn_controller.getAll();
  res.status(rows.code).send(rows.response);
});

router.get("/:id", async (req, res) => {
  rows = await txn_controller.get();
  res.status(rows.code).send(rows.response);
});

router.post("/", async (req, res) => {
  rows = await txn_controller.create();
  res.status(rows.code).send(rows.response);
});
