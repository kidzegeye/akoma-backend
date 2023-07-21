/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: The transaction managing API
 *
 * components:
 *  securitySchemes:
 *     sessionToken:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *  schemas:
 *     Transaction:
 *       type: object
 *       required:
 *        - username
 *        - startDate
 *        - endDate
 *        - transactionType
 *        - frequency
 *        - transactionName
 *        - amount
 *        - received
 *       properties:
 *         username:
 *           type: string
 *           description: The user's username
 *         startDate:
 *           type: number
 *           description: The start date of the transaction (UNIX timestamp)
 *         endDate:
 *           type: number
 *           description: The end date of the transaction (UNIX timestamp)
 *         transactionType:
 *           type: number
 *           description: The transaction type of the transaction
 *         frequency:
 *           type: string
 *           description: The frequency of the transaction
 *         transactionName:
 *           type: string
 *           description: The name of the transaction
 *           enum: [1, 2, 3]
 *         amount:
 *           type: text
 *           description: The monetary amount of the transaction.
 *         received:
 *           type: boolean
 *           description: Whether the transaction has been received
 *         dueDate:
 *           type: number
 *           description: The due date of the transaction (UNIX timestamp)
 *     TransactionTID:
 *       allOf:
 *        - $ref: '#/components/schemas/Transaction'
 *        - type: object
 *          required:
 *           - tid
 *          properties:
 *           tid:
 *              type: number
 *              description: The transaction's id
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
 *     security:
 *      - sessionToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *               startDate:
 *                 type: number
 *                 description: Transaction's start date (UNIX timestamp)
 *               endDate:
 *                 type: number
 *                 description: Transaction's end date (UNIX timestamp)
 *               transactionType:
 *                 type: number
 *                 description: Transaction's type
 *                 enum: [1, 2, 3]
 *             required:
 *               - username
 *     responses:
 *       200:
 *         description: List of txns
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Session Expired
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Session Expired
 *       404:
 *         description: User/Session Not Found
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Not Found
 *       500:
 *         description: Internal Server Error
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Internal Server Error
 */
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

/**
 * @swagger
 * /api/transaction/get-one:
 *   post:
 *     summary: Get one txns from a user
 *     tags: [Transaction]
 *     security:
 *      - sessionToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *               tid:
 *                 type: string
 *                 description: Transaction's id
 *             required:
 *               - username
 *               - tid
 *     responses:
 *       200:
 *         description: The txn.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Session Expired
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Session Expired
 *       404:
 *         description: User/Session Not Found
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Not Found
 *       500:
 *         description: Internal Server Error
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Internal Server Error
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
 *     security:
 *      - sessionToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       201:
 *         description: Confirmation of txn creation
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Transaction Added
 *       400:
 *         description: Session Expired
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Session Expired
 *       404:
 *         description: User/Session Not Found
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Not Found
 *       500:
 *         description: Internal Server Error
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Internal Server Error
 */
router.post(
  "/",
  checkSchema(txnSchema),
  body("username").trim().notEmpty(),
  header("authorization").trim().notEmpty(),
  body("amount").isCurrency(
    (options = {
      require_symbol: false,
      decimal_separator: ".",
      require_decimal: true,
    })
  ),
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
 *     security:
 *      - sessionToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionTID'
 *     responses:
 *       201:
 *         description: Confirmation of txn update
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Transaction Updated
 *       400:
 *         description: Session Expired
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Session Expired
 *       404:
 *         description: User/Session Not Found
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Not Found
 *       500:
 *         description: Internal Server Error
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Internal Server Error
 */
router.put(
  "/",
  checkSchema(txnSchema),
  body("username").trim().notEmpty(),
  body("tid").trim().notEmpty(),
  body("amount").isCurrency(
    (options = {
      require_symbol: false,
      decimal_separator: ".",
      require_decimal: true,
    })
  ),
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
