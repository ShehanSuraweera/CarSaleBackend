const express = require("express");
const router = express.Router();
const {
  createAd,
  uploadAdImages,
  getAds,
  getTrendingAds,
  getAd,
} = require("../controllers/adController");
const { validateToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

router.post("/create", validateToken, upload.none(), createAd);
router.post("/upload-imageUrls", uploadAdImages);
router.get("/ads", getAds);
router.post("/trending-ads", getTrendingAds);
router.post("/ad", getAd);

module.exports = router;
