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
const { body, validationResult } = require("express-validator");
const user_controller = require("../repo/userRepo.js");
const router = express.Router();
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
 * /{uid}:
 *   get:
 *     summary: Get specific user
 *     tags: [User]
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: One user.
 
 *       500:
 *         description: Some server error
 */
router.get("/:id", async (req, res) => {
  rows = await user_controller.get(req.params.id);
  res.status(rows.code).send(rows.response);
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
router.post("/", async (req, res) => {
  rows = await user_controller.create(req.body);
  res.status(rows.code).send(rows.response);
});

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
  body("sessionToken").trim().notEmpty(),
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      rows = await user_controller.logout(
        req.body.username,
        req.body.sessionToken
      );
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
  body("refreshToken").trim().notEmpty(),
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      rows = await user_controller.refreshSession(
        req.body.username,
        req.body.refreshToken
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
router.put("/", async (req, res) => {
  rows = await user_controller.update(req.body);
  res.status(rows.code).send(rows.response);
});
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
  body("sessionToken").trim().notEmpty(),
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      rows = await user_controller.delete(
        req.body.username,
        req.body.sessionToken
      );
      res.status(rows.code).send(rows.response);
    } else {
      res.send({ errors: result.array() });
    }
  }
);

module.exports = router;
