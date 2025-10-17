const express = require("express");
const {
  profile,
  updateProfile,
  likeAd,
  unlikeAd,
  getUserLikedAdIds,
  getUserLikedAds,
} = require("../controllers/userController");
const upload = require("../middleware/multer");
const router = express.Router();

router.post("/profile", profile);
router.post("/update", upload.none(), updateProfile);
router.post("/liked-ad-ids", getUserLikedAdIds);
router.post("/like-ad", likeAd);
router.delete("/unlike-ad", unlikeAd);
router.post("/liked-ads", getUserLikedAds);

module.exports = router;
