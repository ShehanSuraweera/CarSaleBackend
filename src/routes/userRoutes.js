const express = require("express");
const { profile } = require("../controllers/userController");
const { validateToken } = require("../midddleware/authMiddleware");
const router = express.Router();

router.get("/profile", validateToken, profile);

module.exports = router;
