const express = require("express");
const {
  register,
  login,
  logout,
  userTokenVerify,
} = require("../controllers/authController");
const { validateToken } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify-token", validateToken, userTokenVerify);

module.exports = router;
