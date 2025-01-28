const supabase = require("../config/supabase");

const createAd = async (req, res) => {
  const {
    owner_username,
    make,
    model,
    frame_code,
    build_year,
    transmission,
    body_type,
    vehicle_condition,
    reg_year,
    mileage,
    engine,
    colour,
    fuel_type,
    price,
    owner_comments,
    owner_contact,
    ad_location,
    owner_display_name,
    is_negotiable,
    vehicle_type,
  } = req.body;

  if (
    !owner_username ||
    !make ||
    !model ||
    !frame_code ||
    !build_year ||
    !transmission ||
    !body_type ||
    !vehicle_condition ||
    !reg_year ||
    !mileage ||
    !engine ||
    !colour ||
    !fuel_type ||
    !price ||
    !owner_comments ||
    !owner_contact ||
    !ad_location ||
    !owner_display_name ||
    is_negotiable === undefined ||
    !vehicle_type
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const { username } = req.authenticatedUser;

  if (!username || username !== owner_username) {
    return res
      .status(403)
      .json({ error: "Invalid request, user not authenticated." });
  }

  try {
    const { data, error } = await supabase
      .from("ads_vehicles")
      .select("ad_id")
      .order("ad_id", { ascending: false })
      .limit(1);

    const adId = data.length > 0 ? data[0].ad_id + 1 : 1;

    const { data: adData, error: adError } = await supabase
      .from("ads_vehicles")
      .insert([
        {
          owner_username,
          ad_id: adId,
          make,
          model,
          frame_code,
          build_year,
          transmission,
          body_type,
          vehicle_condition,
          reg_year,
          mileage,
          engine,
          colour,
          fuel_type,
          price,
          owner_comments,
          owner_contact,
          ad_location,
          owner_display_name,
          is_negotiable,
          vehicle_type,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({ message: "Database error", adError });
    }

    res.status(201).json({ message: "ad posted successfully", adId: adId });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const uploadAdImages = async (req, res) => {
  const { ad_id, image_url } = req.body;

  if (!ad_id || !image_url) {
    res.status(400).json({ message: "ad_id and image url are required" });
  }

  try {
    const { data, error } = await supabase
      .from("ad_images")
      .insert([
        {
          ad_id,
          image_url,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({ message: "Database error", error });
    }

    res.status(201).json({ message: "Uploaded", image_url: image_url });
  } catch (error) {
    console.log("error", error);
  }
};

const getAds = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("ads_vehicles")
      .select(`*, ad_images (image_url, created_at)`);

    if (error) {
      return res.status(500).json({ message: "Database error", error });
    }

    res.status(200).json({ ads: data });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTrendingAds = async (req, res) => {
  const { make, type } = req.body;
  // Ensure the 'make' field is provided
  if (!make && !type) {
    return res
      .status(400)
      .json({ message: "Make and Type is required to filter ads" });
  }
  try {
    const { data, error } = await supabase
      .from("ads_vehicles")
      .select(`*, ad_images (image_url, created_at)`)
      .eq("make", make)
      .eq("vehicle_type", type)
      .order("views", { ascending: false })
      .limit(10);

    // Handle database error
    if (error) {
      return res.status(500).json({ message: "Database error", error });
    }

    // Return filtered ads
    res.status(200).json({ ads: data });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateViews = async (ad_id) => {
  const { data, error } = await supabase
    .from("ads_vehicles")
    .select("views")
    .eq("ad_id", ad_id);

  if (error) {
    console.log(error);
  } else {
    const views = data[0].views + 1;
    const { error: updateError } = await supabase
      .from("ads_vehicles")
      .update({ views: views })
      .eq("ad_id", ad_id);
    if (updateError) {
      console.log(updateError);
    }
  }
};

const getAd = async (req, res) => {
  const { ad_id } = req.body;

  if (!ad_id) {
    return res.status(400).json({ message: "ad is is required to display ad" });
  }

  try {
    const { data, error } = await supabase
      .from("ads_vehicles")
      .select(`*, ad_images (image_url, created_at)`)
      .eq("ad_id", ad_id);

    if (error) {
      return res.status(500).json({ message: "Database error", error });
    }

    updateViews(ad_id);

    res.status(200).json({ ad: data[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAdsByUser = async (req, res) => {
  const { owner_username } = req.body;
  if (!owner_username) {
    return res
      .status(400)
      .json({ message: "Username is required to display ads" });
  }

  try {
    const { data, error } = await supabase
      .from("ads_vehicles")
      .select(`*, ad_images (image_url, created_at)`)
      .eq("owner_username", owner_username);

    if (error) {
      return res.status(500).json({ message: "Database error", error });
    }

    res.status(200).json({ ads: data });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createAd,
  uploadAdImages,
  getAds,
  getTrendingAds,
  getAd,
  getAdsByUser,
};
