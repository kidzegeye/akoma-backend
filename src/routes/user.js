const express = require("express");
const { body, validationResult } = require("express-validator");
const user_controller = require("../repo/userRepo.js");
const router = express.Router();

router.get("/", async (req, res) => {
  rows = await user_controller.getAll();
  res.status(rows.code).send(rows.response);
});

router.get("/:id", async (req, res) => {
  rows = await user_controller.get(req.params.id);
  res.status(rows.code).send(rows.response);
});

router.post("/", async (req, res) => {
  rows = await user_controller.create(req.body);
  res.status(rows.code).send(rows.response);
});

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

router.put("/", async (req, res) => {
  rows = await user_controller.update(req.body);
  res.status(rows.code).send(rows.response);
});

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
