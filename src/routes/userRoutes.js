const express = require("express");
const { profile, updateProfile } = require("../controllers/userController");
const upload = require("../middleware/multer");
const router = express.Router();

router.post("/profile", profile);
router.post("/update", upload.none(), updateProfile);

module.exports = router;
