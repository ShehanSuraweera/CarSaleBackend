const supabase = require("../config/supabase");

const createAd = async (req, res) => {
  const {
    user_id,
    model_id,
    frame_code,
    build_year,
    transmission_type_id,
    body_type_id,
    vehicle_condition_id,
    reg_year,
    engine,
    colour,
    fuel_type_id,
    owner_comments,
    owner_contact,
    owner_display_name,
    is_negotiable,
    city_id,
  } = req.body;

  let { price, mileage } = req.body;

  if (
    !user_id ||
    !model_id ||
    !build_year ||
    !transmission_type_id ||
    !body_type_id ||
    !vehicle_condition_id ||
    !fuel_type_id ||
    !owner_contact ||
    !city_id ||
    !owner_display_name ||
    is_negotiable === undefined
  ) {
    return res.status(400).json({ message: "mandotaory fields are required." });
  }
  if (price?.trim() == "") {
    price = null;
  }
  mileage = cleanString(mileage);
  price = cleanString(price);
  let title = "";
  try {
    const { data, error } = await supabase
      .from("models")
      .select("name, makes(name)")
      .eq("id", model_id)
      .single();

    if (error) {
      console.log("Model Fetch Error:", error);
    }

    const make = data.makes.name;
    const model = data.name;

    title = `${make || ""} ${model || ""} ${frame_code || ""} ${
      build_year || ""
    }`.trim();
  } catch (error) {
    console.log(error);
  }

  try {
    // Ensure Supabase client is initialized
    if (!supabase) {
      console.log("Supabase client is not initialized.");
      return res.status(500).json({ message: "Internal server error." });
    }

    const { data: adData, error: adError } = await supabase
      .from("ads_vehicles")
      .insert([
        {
          user_id,
          model_id,
          frame_code,
          build_year,
          transmission_type_id,
          body_type_id,
          vehicle_condition_id,
          reg_year,
          mileage,
          engine,
          colour,
          fuel_type_id,
          price,
          owner_comments,
          owner_contact,
          city_id,
          owner_display_name,
          is_negotiable,
          title,
        },
      ])
      .select("ad_id");

    if (adError) {
      console.log("Ad Insertion Error:", adError);
      return res
        .status(500)
        .json({ message: "Database error", error: adError });
    }

    const adId = adData?.[0]?.ad_id;

    res
      .status(201)
      .json({ message: "ad posted successfully", adData, adId: adId });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

const uploadAdImages = async (req, res) => {
  const { ad_id, image_url } = req.body;

  if (!ad_id || !image_url) {
    return res
      .status(400)
      .json({ message: "ad_id and image url are required" });
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
      console.error("Supabase Insert Error:", error);
      return res.status(500).json({ message: "Database error", error });
    }

    res.status(201).json({ message: "Uploaded", image_url: image_url });
  } catch (error) {
    console.error("Unhandled error in uploadAdImages:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

function cleanString(input) {
  return parseInt(input?.replace(/[^0-9]/g, ""), 10);
}

const getAds = async (req, res) => {
  const {
    query,
    make_id,
    model_id,
    body_type_id,
    transmission_type_id,
    buildYear,
    district_id,
    city_id,
    vehicle_type_id,
    fuel_type_id,
    vehicle_condition_id,
  } = req.query;

  let { maxMileage, maxPrice, minPrice, page, limit } = req.query;
  page = parseInt(page, 10) || 1;
  limit = parseInt(limit, 10) || 10;
  const startIndex = (page - 1) * limit; // Calculate the start index
  const endIndex = startIndex + limit - 1; // Calculate the end index

  maxMileage = cleanString(maxMileage);
  maxPrice = cleanString(maxPrice);
  minPrice = cleanString(minPrice);

  try {
    let supabaseQuery = supabase
      .from("ads_vehicles")
      .select(
        `*, ad_images (image_url, created_at), cities!inner(name, districts!inner(name)), models!inner(name, vehicle_type_id, makes!inner(id,name)), body_types (id,name) ,transmission_types (id,name), fuel_types (id,name)`
      )
      .order("created_at", { ascending: false })
      .eq("is_deleted", false)
      .limit(limit)
      .range(startIndex, endIndex);

    if (query) {
      supabaseQuery = supabaseQuery.ilike("title", `%${query}%`);
    }
    if (make_id) {
      supabaseQuery = supabaseQuery.eq("models.makes.id", make_id);
    }
    if (model_id) {
      supabaseQuery = supabaseQuery.eq("model_id", model_id);
    }
    if (body_type_id) {
      supabaseQuery = supabaseQuery.eq("body_type_id", body_type_id);
    }
    if (minPrice) {
      supabaseQuery = supabaseQuery.gte("price", minPrice);
    }
    if (maxPrice) {
      supabaseQuery = supabaseQuery.lte("price", maxPrice);
    }
    if (vehicle_type_id) {
      supabaseQuery = supabaseQuery.eq(
        "models.vehicle_type_id",
        vehicle_type_id
      );
    }
    if (vehicle_condition_id) {
      supabaseQuery = supabaseQuery.eq(
        "vehicle_condition_id",
        vehicle_condition_id
      );
    }
    if (fuel_type_id) {
      supabaseQuery = supabaseQuery.eq("fuel_type_id", fuel_type_id);
    }

    if (transmission_type_id) {
      supabaseQuery = supabaseQuery.eq(
        "transmission_type_id",
        transmission_type_id
      );
    }

    if (maxMileage) {
      supabaseQuery = supabaseQuery.lte("mileage", maxMileage);
    }
    if (buildYear) {
      supabaseQuery = supabaseQuery.gte("build_year", buildYear);
    }
    if (district_id) {
      supabaseQuery = supabaseQuery.eq("cities.district_id", district_id);
    }
    if (city_id) {
      supabaseQuery = supabaseQuery.eq("cities.id", city_id);
    }

    const { data, error } = await supabaseQuery;

    // If data is found, format each ad
    const formattedAds = data.map((ad) => {
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
          name: ad.transmission_types.name,
          id: ad.transmission_types.id,
        },
        fuel_type: { name: ad.fuel_types.name, id: ad.fuel_types.id },
      };

      // Clean up unnecessary fields
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
    });

    if (error) return res.status(500).json({ error: error.message });

    res.json({ ads: formattedAds });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTrendingAds = async (req, res) => {
  const { make_id, vehicle_type_id } = req.body;
  // Ensure the 'make' field is provided
  if (!make_id && !vehicle_type_id) {
    return res
      .status(400)
      .json({ message: "Both make_id and vehicle_type_id are required" });
  }
  try {
    const { data, error } = await supabase
      .from("ads_vehicles")
      .select(
        `price,ad_id, 
        ad_images (image_url, created_at), 
        models!inner(name, vehicle_type_id, 
          makes!inner(id, name)
        )`
      )
      .filter("models.makes.id", "eq", make_id) // Correct filtering
      .filter("models.vehicle_type_id", "eq", vehicle_type_id)
      .filter("is_deleted", "eq", false)
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
      .select(
        `
        *,
        ad_images (image_url, created_at),
         cities!inner(name, district_id, districts!inner(name)),
         models!inner(name,  makes!inner(id,name), vehicle_types!inner(id,name)), body_types (id,name), transmission_types (id,name), fuel_types (id,name), vehicle_conditions(id, name)
      `
      )
      .eq("ad_id", ad_id)
      .eq("is_deleted", false)
      .single();

    if (error) {
      return res.status(500).json({ message: "Database error", error });
    }

    const formattedData = {
      ...data,
      make: { name: data.models.makes.name, id: data.models.makes.id },
      model: { name: data.models.name, id: data.model_id },
      vehicle_type: {
        id: data.models.vehicle_types.id,
        name: data.models.vehicle_types.name,
      },
      city: { name: data.cities.name, id: data.city_id },
      district: {
        name: data.cities.districts.name,
        id: data.cities.district_id,
      },
      images: data.ad_images ? data.ad_images.map((img) => img.image_url) : [],
      body_type: { id: data.body_type_id, name: data.body_types.name },
      transmission_type: {
        id: data.transmission_type_id,
        name: data.transmission_types.name,
      },
      fuel_type: { id: data.fuel_types.id, name: data.fuel_types.name },
      vehicle_condition: {
        id: data.vehicle_conditions.id,
        name: data.vehicle_conditions.name,
      },
    };

    delete formattedData.ad_images;
    delete formattedData.models;
    delete formattedData.cities;
    delete formattedData.city_id;
    delete formattedData.model_id;
    delete formattedData.body_type_id;
    delete formattedData.body_types;
    delete formattedData.transmission_type_id;
    delete formattedData.transmission_types;
    delete formattedData.fuel_types;
    delete formattedData.vehicle_conditions;

    updateViews(ad_id);

    res.status(200).json({ ad: formattedData });
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
      .select(
        `*, ad_images (image_url, created_at),
         cities!inner(name, district_id, districts!inner(name)),
         models!inner(name, vehicle_type_id, makes!inner(id,name)), body_types (id,name) , transmission_types (id,name) , fuel_types (id,name)`
      )
      .eq("user_id", id)
      .eq("is_deleted", false);

    if (error) {
      return res.status(500).json({ message: "Database error", error });
    }

    // If data is found, format each ad
    const formattedAds = data.map((ad) => {
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
        fuel_type: { name: ad.fuel_types.name, id: ad.fuel_types },
      };

      // Clean up unnecessary fields
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
    });

    res.status(200).json({ ads: formattedAds });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteImagesByAdId = async (ad_id, bucketName) => {
  try {
    // Fetch all images for the given ad_id
    const { data: images, error: fetchError } = await supabase
      .from("ad_images")
      .select("image_url")
      .eq("ad_id", ad_id);

    if (fetchError) {
      console.error("Error fetching images:", fetchError.message);
      throw fetchError;
    }

    if (!images || images.length === 0) {
      console.log("No images found for ad_id:", ad_id);
      return;
    }

    // Extract file paths from URLs
    const filePaths = images.map(
      (img) => img.image_url.split(`/${bucketName}/`)[1]
    );

    // Delete images from Supabase Storage
    const { error: storageError } = await supabase.storage
      .from(bucketName)
      .remove(filePaths);

    if (storageError) {
      console.error(
        "Error deleting images from storage:",
        storageError.message
      );
      throw storageError;
    }

    // Delete image records from the database
    const { error: dbError } = await supabase
      .from("ad_images")
      .delete()
      .match({ ad_id });

    if (dbError) {
      console.error("Error deleting image records:", dbError.message);
      throw dbError;
    }
  } catch (error) {
    console.error("Error in deleteImagesByAdId:", error);
  }
};

const editAd = async (req, res) => {
  const {
    user_id,

    frame_code,
    build_year,

    reg_year,
    engine,
    colour,

    owner_comments,
    owner_contact,
    owner_display_name,
    is_negotiable,
  } = req.body;

  let {
    city_id,
    fuel_type_id,
    body_type_id,
    vehicle_condition_id,
    transmission_type_id,
    model_id,
    ad_id,
    price,
    mileage,
  } = req.body;

  if (
    !ad_id ||
    !user_id ||
    !model_id ||
    !build_year ||
    !transmission_type_id ||
    !body_type_id ||
    !vehicle_condition_id ||
    !fuel_type_id ||
    !owner_contact ||
    !city_id ||
    !owner_display_name ||
    is_negotiable === undefined
  ) {
    return res.status(400).json({ message: "mandotaory fields are required." });
  }

  ad_id = Array.isArray(ad_id) ? Number(ad_id[0]) : Number(ad_id);
  model_id = Array.isArray(model_id) ? Number(model_id[0]) : Number(model_id);
  transmission_type_id = Array.isArray(transmission_type_id)
    ? Number(transmission_type_id[0])
    : Number(transmission_type_id);
  body_type_id = Array.isArray(body_type_id)
    ? Number(body_type_id[0])
    : Number(body_type_id);
  vehicle_condition_id = Array.isArray(vehicle_condition_id)
    ? Number(vehicle_condition_id[0])
    : Number(vehicle_condition_id);
  fuel_type_id = Array.isArray(fuel_type_id)
    ? Number(fuel_type_id[0])
    : Number(fuel_type_id);
  city_id = Array.isArray(city_id) ? Number(city_id[0]) : Number(city_id);

  if (price?.trim() == "") {
    price = null;
  }
  mileage = cleanString(mileage);
  price = cleanString(price);
  let title = "";
  try {
    const { data, error } = await supabase
      .from("models")
      .select("name, makes(name)")
      .eq("id", model_id)
      .single();

    if (error) {
      console.log("Model Fetch Error:", error);
    }

    const make = data.makes.name;
    const model = data.name;

    title = `${make || ""} ${model || ""} ${frame_code || ""} ${
      build_year || ""
    }`.trim();
  } catch (error) {
    console.log(error);
  }

  if (!ad_id) {
    return res.status(400).json({ message: "ad_id is required" });
  }

  try {
    const { data, error } = await supabase
      .from("ads_vehicles")
      .update({
        model_id: model_id,
        frame_code: frame_code,
        build_year: build_year,
        transmission_type_id: transmission_type_id,
        body_type_id: body_type_id,
        vehicle_condition_id: vehicle_condition_id,
        reg_year: reg_year,
        mileage: mileage,
        engine: engine,
        colour: colour,
        fuel_type_id: fuel_type_id,
        price: price,
        owner_comments: owner_comments,
        owner_contact: owner_contact,
        city_id: city_id,
        owner_display_name: owner_display_name,
        is_negotiable: is_negotiable,
        title: title,
      })
      .match({ ad_id: ad_id })
      .select();

    if (error) {
      return res.status(500).json({ message: "Database error", error });
    }

    await deleteImagesByAdId(ad_id, "ad_pics");

    res.status(200).json({ message: "Ad updated successfully", data: data[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteAd = async (req, res) => {
  const { ad_id } = req.body;

  if (!ad_id) {
    return res.status(400).json({ message: "AdID is required." });
  }

  try {
    const { error } = await supabase
      .from("ads_vehicles")
      .update({ is_deleted: true })
      .eq("ad_id", ad_id);

    if (error) {
      console.error("Error deleting ad:", error.message);
      throw error;
    }

    res.status(200).json({ message: "Ad deleted successfully" });
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
  editAd,
  deleteAd,
};
