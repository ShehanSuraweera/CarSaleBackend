const supabase = require("../config/supabase");

const createAd = async (req, res) => {
  const {
    user_id,
    make,
    model,
    frame_code,
    build_year,
    transmission,
    body_type,
    vehicle_condition,
    reg_year,
    engine,
    colour,
    fuel_type,
    owner_comments,
    owner_contact,
    ad_location,
    owner_display_name,
    is_negotiable,
    vehicle_type,
  } = req.body;

  let { price, mileage } = req.body;

  if (
    !user_id ||
    !make ||
    !model ||
    !build_year ||
    !transmission ||
    !body_type ||
    !vehicle_condition ||
    !fuel_type ||
    !owner_contact ||
    !ad_location ||
    !owner_display_name ||
    is_negotiable === undefined ||
    !vehicle_type
  ) {
    return res.status(400).json({ message: "mandotaory fields are required." });
  }
  if (price?.trim() == "") {
    price = null;
  }
  mileage = cleanString(mileage);
  price = cleanString(price);

  const title =
    make + " " + model + " " + frame_code && frame_code + " " + build_year;

  try {
    // Ensure Supabase client is initialized
    if (!supabase) {
      console.log("Supabase client is not initialized.");
      return res.status(500).json({ message: "Internal server error." });
    }

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
          user_id,
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
          title,
        },
      ]);

    if (error) {
      return res.status(500).json({ message: "Database error", adError });
    }

    res
      .status(201)
      .json({ message: "ad posted successfully", adData, adId: adId });
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

function cleanString(input) {
  return parseInt(input?.replace(/[^0-9]/g, ""), 10);
}

const getAds = async (req, res) => {
  const {
    query,
    make,
    model,
    type,
    bodyType,
    transmission,
    location,
    buildYear,
  } = req.query;

  let { maxMileage, maxPrice, minPrice } = req.query;

  maxMileage = cleanString(maxMileage);
  maxPrice = cleanString(maxPrice);
  minPrice = cleanString(minPrice);

  try {
    let supabaseQuery = supabase
      .from("ads_vehicles")
      .select(`*, ad_images (image_url, created_at)`)
      .order("created_at", { ascending: false });

    if (query) {
      supabaseQuery = supabaseQuery.ilike("title", `%${query}%`);
    }
    if (make) {
      supabaseQuery = supabaseQuery.eq("make", make);
    }
    if (model) {
      supabaseQuery = supabaseQuery.eq("model", model);
    }
    if (type) {
      supabaseQuery = supabaseQuery.eq("body_type", type);
    }
    if (minPrice) {
      supabaseQuery = supabaseQuery.gte("price", minPrice);
    }
    if (maxPrice) {
      supabaseQuery = supabaseQuery.lte("price", maxPrice);
    }
    if (bodyType) {
      supabaseQuery = supabaseQuery.eq("body_type", bodyType);
    }
    if (transmission) {
      supabaseQuery = supabaseQuery.eq("transmission", transmission);
    }
    if (location) {
      supabaseQuery = supabaseQuery.eq("ad_location", location);
    }
    if (maxMileage) {
      supabaseQuery = supabaseQuery.lte("mileage", maxMileage);
    }
    if (buildYear) {
      supabaseQuery = supabaseQuery.gte("build_year", buildYear);
    }

    const { data, error } = await supabaseQuery;

    if (error) return res.status(500).json({ error: error.message });
    res.json({ ads: data });
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
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "User is required to display ads" });
  }

  try {
    const { data, error } = await supabase
      .from("ads_vehicles")
      .select(`*, ad_images (image_url, created_at)`)
      .eq("user_id", id);

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
