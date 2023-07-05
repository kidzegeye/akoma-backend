/**
 * @swagger
 * tags:
 *   name: User
 *   description: The user managing API
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the User
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
  gid: {
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
 * /:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: List of users.
 *       500:
 *         description: Some server error
 */

router.get("/", async (req, res) => {
  rows = await user_controller.getAll();
  res.status(rows.code).send(rows.response);
});
/**
 * @swagger
 * /get:
 *   post:
 *     summary: Get specific user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: One user.
 
 *       500:
 *         description: Some server error
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
 *  /:
 *   post:
 *     summary: Create a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Created user's session data.
 
 *       500:
 *         description: Some server error
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
 * @swagger
 *  /login:
 *   post:
 *     summary: Login to a user's account
 *     tags: [User]
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: The user's session data
 
 *       500:
 *         description: Some server error
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
 * @swagger
 *  /logout:
 *   get:
 *     summary: Logout of a user's account
 *     tags: [User]
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Logout confirmation.
 
 *       500:
 *         description: Some server error
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
 *  /session:
 *   get:
 *     summary: Refresh a user's session
 *     tags: [User]
 *     requestBody:
 *       required: false
 *     responses:
 *       201:
 *         description: The user's session data.
 
 *       500:
 *         description: Some server error
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
 *  /:
 *   put:
 *     summary: Update a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Update confirmation.
 
 *       500:
 *         description: Some server error
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
 *  /:
 *   delete:
 *     summary: Delete a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Deletion confirmation.
 
 *       500:
 *         description: Some server error
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
