const express = require("express");
const { profile } = require("../controllers/userController");
const { validateToken } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/profile", validateToken, profile);

module.exports = router;
