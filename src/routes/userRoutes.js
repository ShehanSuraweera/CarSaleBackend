const express = require("express");
const { profile, updateProfile } = require("../controllers/userController");
const { validateToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");
const router = express.Router();

router.post("/profile", profile);
router.post("/update", upload.none(), updateProfile);

module.exports = router;
