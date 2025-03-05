const express = require("express");
const {
  profile,
  updateProfile,
  getUserLikedAds,
  likeAd,
  unlikeAd,
} = require("../controllers/userController");
const upload = require("../middleware/multer");
const router = express.Router();

router.post("/profile", profile);
router.post("/update", upload.none(), updateProfile);
router.post("/liked-ads", getUserLikedAds);
router.post("/like-ad", likeAd);
router.delete("/unlike-ad", unlikeAd);

module.exports = router;
