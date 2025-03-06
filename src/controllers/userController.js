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

const getUserLikedAdIds = async (req, res) => {
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

const getUserLikedAds = async (req, res) => {
  const { user_id: userId } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ message: "User ID is required to fetch liked ads" });
  }

  try {
    const { data, error } = await supabase
      .from("liked_ads")
      .select(
        `ads_vehicles(*, 
          ad_images (image_url, created_at),
          cities!inner(name, district_id, districts!inner(name)),
          models!inner(name, vehicle_type_id, makes!inner(id,name)), 
          body_types (id, name),
          transmission_types (id, name),
          fuel_types (id, name)
        )`
      )
      .eq("user_id", userId)
      .eq("ads_vehicles.is_approved", true);

    if (error) {
      return res.status(500).json({ message: "Database error", error });
    }

    // Format ads like in getAdsByUser
    const formattedAds = data
      .map(({ ads_vehicles: ad }) => {
        if (!ad) return null; // Handle possible null values

        const formattedAd = {
          ...ad,
          make: { name: ad.models.makes.name, id: ad.models.makes.id },
          model: { name: ad.models.name, id: ad.model_id },
          vehicle_type_id: ad.models.vehicle_type_id,
          city: { name: ad.cities.name, id: ad.city_id },
          district: {
            name: ad.cities.districts.name,
            id: ad.cities.district_id,
          },
          images: ad.ad_images ? ad.ad_images.map((img) => img.image_url) : [],
          body_type: { name: ad.body_types.name, id: ad.body_type_id },
          transmission_type: {
            id: ad.transmission_types.id,
            name: ad.transmission_types.name,
          },
          fuel_type: { name: ad.fuel_types.name, id: ad.fuel_types.id },
        };

        // Remove unnecessary fields
        delete formattedAd.ad_images;
        delete formattedAd.models;
        delete formattedAd.cities;
        delete formattedAd.city_id;
        delete formattedAd.model_id;
        delete formattedAd.body_type_id;
        delete formattedAd.body_types;
        delete formattedAd.transmission_type_id;
        delete formattedAd.transmission_types;
        delete formattedAd.fuel_types;

        return formattedAd;
      })
      .filter(Boolean); // Remove any null values

    return res.status(200).json({ ads: formattedAds });
  } catch (error) {
    console.error("Error fetching liked ads:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  profile,
  updateProfile,
  getUserLikedAdIds,
  likeAd,
  unlikeAd,
  getUserLikedAds,
};
