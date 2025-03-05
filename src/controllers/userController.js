const supabase = require("../config/supabase");

const profile = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select(`*, cities(name, district_id, districts(id, name))`)
      .eq("id", user_id);

    if (userError) {
      return res
        .status(500)
        .json({ error: "Database error", message: userError.message });
    }

    const formattedDatas = userData.map((user) => {
      const formattedData = {
        ...user,
        city: user.cities ? { name: user.cities.name, id: user.city_id } : null,
        district: user.cities?.districts
          ? { name: user.cities.districts.name, id: user.cities.districts.id }
          : null,
      };
      delete formattedData.city_id;
      delete formattedData.cities;

      return formattedData;
    });

    res.status(200).json({ user: formattedDatas[0] });
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

const updateProfile = async (req, res) => {
  const { user_id, name, phone, city_id, avatar_url } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID required" });
  }

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        name: name,
        phone: phone,
        city_id: city_id,
      })
      .eq("id", user_id);

    if (error) {
      return res
        .status(500)
        .json({ error: "Database error", message: error.message });
    }

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

const getUserLikedAds = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID required" });
  }

  try {
    const { data: likedAds, error: likedAdsError } = await supabase
      .from("liked_ads")
      .select(`*`)
      .eq("user_id", user_id);

    if (likedAdsError) {
      return res
        .status(500)
        .json({ error: "Database error", message: likedAdsError.message });
    }

    res.status(200).json({ likedAds });
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

const likeAd = async (req, res) => {
  const { userId, adId } = req.body;

  if (!userId || !adId) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const { error } = await supabase.from("liked_ads").upsert({
      user_id: userId,
      ad_id: adId,
    });

    if (error) {
      return res
        .status(500)
        .json({ error: "Database error", message: error.message });
    }

    res.status(200).json({ message: "Ad liked successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

const unlikeAd = async (req, res) => {
  const { userId, adId } = req.body;

  if (!userId || !adId) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const { error } = await supabase
      .from("liked_ads")
      .delete()
      .eq("user_id", userId)
      .eq("ad_id", adId);

    if (error) {
      return res
        .status(500)
        .json({ error: "Database error", message: error.message });
    }

    res.status(200).json({ message: "Ad unliked successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

module.exports = {
  profile,
  updateProfile,
  getUserLikedAds,
  likeAd,
  unlikeAd,
};
