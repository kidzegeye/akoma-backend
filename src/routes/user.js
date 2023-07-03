const express = require("express");
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

router.post("/login", async (req, res) => {
  rows = await user_controller.validate(req.body);
  res.status(rows.code).send(rows.response);
});

router.put("/:id", async (req, res) => {
  rows = await user_controller.update(id, req.body);
  res.send(rows);
});

router.delete("/:id", async (req, res) => {
  rows = await user_controller.delete(id);
  res.send(rows);
});

module.exports = router;
