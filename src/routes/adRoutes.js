const express = require("express");
const router = express.Router();
const { createAd, uploadAdImages } = require("../controllers/adController");
const { validateToken } = require("../midddleware/authMiddleware");
const upload = require("../midddleware/multer");

router.post("/create", validateToken, upload.none(), createAd);
router.post("/upload-imageUrls", uploadAdImages);

module.exports = router;
