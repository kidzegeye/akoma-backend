/**
 * @swagger
 * tags:
 *   name: User
 *   description: The user managing API
 *
 * components:
 *   securitySchemes:
 *     sessionToken:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     refreshToken:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *        - firstName
 *        - lastName
 *        - email
 *        - phoneNumber
 *        - region
 *        - ghanaCardNum
 *        - businessName
 *        - industry
 *        - address
 *       properties:
 *         firstName:
 *           type: string
 *           description: The first name of the User
 *         lastName:
 *           type: string
 *           description: The last name of the User
 *         email:
 *           type: string
 *           format: email
 *           description: The email of the User
 *         phoneNumber:
 *           type: string
 *           description: The phone number of the User
 *         region:
 *           type: string
 *           description: The region of the User
 *         ghanaCardNum:
 *           type: string
 *           description: The Ghana ID of the User
 *         businessName:
 *           type: string
 *           description: The name of the User's business
 *         industry:
 *           type: string
 *           description: The industry of the User
 *         address:
 *           type: string
 *           description: The business' address
 *     UserUname:
 *      allOf:
 *       - $ref: '#/components/schemas/User'
 *       - type: object
 *         required:
 *          - username
 *         properties:
 *          username:
 *             type: string
 *             description: The username of User
 *     UserUnamePW:
 *       allOf:
 *        - $ref: '#/components/schemas/UserUname'
 *        - type: object
 *          required:
 *           - password
 *          properties:
 *            password:
 *              type: string
 *              format: password
 *              description: The password of the User
 *     Session:
 *       type: object
 *       properties:
 *         sessionToken:
 *           type: string
 *           description: Token used for authenticating a User session
 *         expiration:
 *           type: number
 *           description: DateTime (in UNIX milliseconds) of when the session token expires
 *         refreshToken:
 *           type: string
 *           description: Token used for generating a new session token
 *
 */
const express = require("express");
const {
  body,
  header,
  validationResult,
  checkSchema,
} = require("express-validator");
const user_controller = require("../repo/userRepo.js");
const router = express.Router();
const userSchema = {
  firstName: {
    trim: true,
    notEmpty: true,
  },
  lastName: {
    trim: true,
    notEmpty: true,
  },
  email: {
    trim: true,
    notEmpty: true,
    isEmail: true,
  },
  username: {
    trim: true,
    notEmpty: true,
  },
  phoneNumber: {
    trim: true,
    notEmpty: true,
  },
  region: {
    trim: true,
    notEmpty: true,
  },
  ghanaCardNum: {
    trim: true,
    notEmpty: true,
  },
  businessName: {
    trim: true,
    notEmpty: true,
  },
  industry: {
    trim: true,
    notEmpty: true,
  },
  address: {
    trim: true,
    notEmpty: true,
  },
};
/**
 * @swagger
 * /api/user/:
 *   get:
 *     summary: Get all users
 *     description: Get all users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of users.
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *               $ref: '#/components/schemas/UserUname'
 *       500:
 *         description: Internal Server Error
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Internal Server Error.
 */

router.get("/", async (req, res) => {
  rows = await user_controller.getAll();
  res.status(rows.code).send(rows.response);
});
/**
 * @swagger
 * /api/user/get:
 *   post:
 *     summary: Get specific user
 *     description: Get specific user
 *     tags: [User]
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
 *             required:
 *               - username
 *     responses:
 *       200:
 *         description: One user
 *         content:
 *          application/json:
 *            schema:
 *               $ref: '#/components/schemas/UserUname'
 *       404:
 *         description: User Not Found
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: User Not Found
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
router.post("/get", body("username").trim().notEmpty(), async (req, res) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    rows = await user_controller.get(req.body.username);
    res.status(rows.code).send(rows.response);
  } else {
    res.send({ errors: result.array() });
  }
});

/**
 *  @swagger
 *  /api/user/:
 *   post:
 *     summary: Create a user
 *     description: Create a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserUnamePW'
 *     responses:
 *       201:
 *         description: Created user's session data.
 *         content:
 *          application/json:
 *            schema:
 *               $ref: '#/components/schemas/Session'
 *       400:
 *         description: User Already Exists
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: User Already Exists
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
  checkSchema(userSchema),
  body("username").trim().notEmpty(),
  body("password").trim().notEmpty(),
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      rows = await user_controller.create(req.body);
      res.status(rows.code).send(rows.response);
    } else {
      res.send({ errors: result.array() });
    }
  }
);

/**
 *  @swagger
 *  /api/user/login:
 *   post:
 *     summary: Login to a user's account
 *     description: Login to a user's account
 *     tags: [User]
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
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *             required:
 *               - username
 *               - password
 *     responses:
 *       201:
 *         description: Created user's session data.
 *         content:
 *          application/json:
 *            schema:
 *               $ref: '#/components/schemas/Session'
 *       400:
 *         description: Login Failed
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Login Failed
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
  "/login",
  body("username").trim().notEmpty(),
  body("password").trim().notEmpty(),
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      rows = await user_controller.validate(
        req.body.username,
        req.body.password
      );
      res.status(rows.code).send(rows.response);
    } else {
      res.send({ errors: result.array() });
    }
  }
);
/**
 *  @swagger
 *  /api/user/logout:
 *   post:
 *     summary: Logout of a user's account
 *     description: Logout of a user's account
 *     tags: [User]
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
 *             required:
 *               - username
 *     responses:
 *       200:
 *         description: Logged Out Confirmation.
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Logged Out
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
  "/logout",
  body("username").trim().notEmpty(),
  header("authorization").trim().notEmpty(),
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const sessionToken = req.headers.authorization.split(" ")[1];
      rows = await user_controller.logout(req.body.username, sessionToken);
      res.status(rows.code).send(rows.response);
    } else {
      res.send({ errors: result.array() });
    }
  }
);
/**
 * @swagger
 *  /api/user/session:
 *   post:
 *     summary: Refresh a user's session
 *     tags: [User]
 *     security:
 *      - refreshToken: []
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
 *             required:
 *               - username
 *     responses:
 *       201:
 *         description: Created user's session data.
 *         content:
 *          application/json:
 *            schema:
 *               $ref: '#/components/schemas/Session'
 *       404:
 *         description: User/Refresh Not Found
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
  "/session",
  body("username").trim().notEmpty(),
  header("authorization").trim().notEmpty(),
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const refreshToken = req.headers.authorization.split(" ")[1];
      rows = await user_controller.refreshSession(
        req.body.username,
        refreshToken
      );
      res.status(rows.code).send(rows.response);
    } else {
      res.send({ errors: result.array() });
    }
  }
);
/**
 * @swagger
 *  /api/user/:
 *   put:
 *     summary: Update a user
 *     tags: [User]
 *     security:
 *      - sessionToken: []
 *     requestBody:
 *       required: true
 *       content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserUname'
 *     responses:
 *       200:
 *         description: Update confirmation.
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Updated User
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
  checkSchema(userSchema),
  header("authorization").trim().notEmpty(),
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const sessionToken = req.headers.authorization.split(" ")[1];
      rows = await user_controller.update(sessionToken, req.body);
      res.status(rows.code).send(rows.response);
    } else {
      res.send({ errors: result.array() });
    }
  }
);
/**
 * @swagger
 *  /api/user/:
 *   delete:
 *     summary: Delete a user
 *     tags: [User]
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
 *             required:
 *               - username
 *     responses:
 *       200:
 *         description: Deletion confirmation.
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  error:
 *                   type: string
 *                   description: Deleted User
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
router.delete(
  "/",
  body("username").trim().notEmpty(),
  header("authorization").trim().notEmpty(),
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const sessionToken = req.headers.authorization.split(" ")[1];
      rows = await user_controller.delete(req.body.username, sessionToken);
      res.status(rows.code).send(rows.response);
    } else {
      res.send({ errors: result.array() });
    }
  }
);

module.exports = router;
