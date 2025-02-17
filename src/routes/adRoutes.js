const express = require("express");
const router = express.Router();
const {
  createAd,
  uploadAdImages,
  getAds,
  getTrendingAds,
  getAd,
  getAdsByUser,
  editAd,
} = require("../controllers/adController");
const upload = require("../middleware/multer");

router.post("/create", upload.none(), createAd);
router.post("/upload-imageUrls", uploadAdImages);
router.get("/ads", getAds);
router.post("/trending-ads", getTrendingAds);
router.post("/ad", getAd);
router.post("/user-ads", getAdsByUser);
router.post("/edit-ad", upload.none(), editAd);

module.exports = router;
