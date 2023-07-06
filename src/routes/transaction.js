/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: The transaction managing API
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         startDate:
 *           type: number
 *           description: The start date of the transaction (UNIX timestamp)
 *
 */
const express = require("express");
const {
  body,
  header,
  validationResult,
  checkSchema,
} = require("express-validator");
const txn_controller = require("../repo/transactionRepo.js");
const router = express.Router();
const txnFilterSchema = {
  startDate: {
    trim: true,
    notEmpty: true,
  },
  endDate: {
    trim: true,
    notEmpty: true,
  },
  transactionType: {
    trim: true,
    notEmpty: true,
  },
};
const txnSchema = {
  startDate: {
    trim: true,
    notEmpty: true,
  },
  endDate: {
    trim: true,
    notEmpty: true,
  },
  transactionType: {
    trim: true,
    notEmpty: true,
  },
  frequency: {
    trim: true,
    notEmpty: true,
  },
  transactionName: {
    trim: true,
    notEmpty: true,
  },
  amount: {
    trim: true,
    notEmpty: true,
  },
  received: {
    trim: true,
    notEmpty: true,
  },
  dueDate: {
    trim: true,
    notEmpty: false,
  },
};

/**
 * @swagger
 * /api/transaction/get:
 *   post:
 *     summary: Get all txns from a user
 *     tags: [Transaction]
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: List of txns.
 *       500:
 *         description: Some server error
 */
router.post(
  "/get",
  checkSchema(txnFilterSchema),
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

/**
 * @swagger
 * /api/transaction/get-one:
 *   post:
 *     summary: Get one txns from a user
 *     tags: [Transaction]
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: The txn.
 *       500:
 *         description: Some server error
 */
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

/**
 * @swagger
 * /api/transaction/:
 *   post:
 *     summary: Create a txn
 *     tags: [Transaction]
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Confirmation of txn creation
 *       500:
 *         description: Some server error
 */
router.post(
  "/",
  checkSchema(txnSchema),
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
/**
 * @swagger
 * /api/transaction/:
 *   put:
 *     summary: Update a txn
 *     tags: [Transaction]
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Confirmation of txn update.
 *       500:
 *         description: Some server error
 */
router.put(
  "/",
  checkSchema(txnSchema),
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
