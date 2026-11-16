// routes/userRoute.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/", userController.getAllUsers);
router.post("/", userController.tambahUser);
router.delete("/:id", userController.hapusUser);

module.exports = router;
