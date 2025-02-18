const supabase = require("../config/supabase");

const getAllDistricts = async (req, res) => {
  try {
    const { data, error } = await supabase.from("districts").select("*");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCitiesByDistrict = async (req, res) => {
  try {
    const district_id = req.params.district_id;
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .eq("district_id", district_id);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllCities = async (req, res) => {
  try {
    const { data, error } = await supabase.from("cities").select("*");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVehicleTypes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("vehicle_types")
      .select("*")
      .order("id");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVehicleMakesByType = async (req, res) => {
  try {
    const vehicle_type_id = req.params.vehicle_type_id;
    const { data, error } = await supabase
      .from("models")
      .select("makes(id, name)")
      .eq("vehicle_type_id", vehicle_type_id);

    if (error) throw error;

    // Extract unique makes
    const uniqueMakes = Array.from(
      new Map(data.map((item) => [item.makes.id, item.makes])).values()
    );
    // Manually sort by id
    uniqueMakes.sort((a, b) => a.id - b.id);
    res.json(uniqueMakes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getModelsByMake = async (req, res) => {
  try {
    const { make_id, vehicle_type_id } = req.body;
    const { data, error } = await supabase
      .from("models")
      .select("id, name")
      .match({ make_id: make_id, vehicle_type_id: vehicle_type_id })
      .order("id");

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllMakes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("makes")
      .select("*")
      .order("id");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const fetchModels = async (req, res) => {
  const { make_id } = req.query;
  try {
    let supabaseQuery = supabase.from("models").select(`*`).order("id");

    if (make_id) {
      supabaseQuery = supabaseQuery.eq("make_id", make_id);
    }

    const { data, error } = await supabaseQuery;

    // if (error) return res.status(500).json({ error: error.message });
    // // Extract unique makes
    // const uniqueMakes = Array.from(
    //   new Map(data.map((item) => [item.makes.id, item.makes])).values()
    // );
    // // Manually sort by id
    // uniqueMakes.sort((a, b) => a.id - b.id);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const fetchBodyTypes = async (req, res) => {
  try {
    const { data, error } = await supabase.from("body_types").select("*");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTransmissionTypes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("transmission_types")
      .select("*");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllDistricts,
  getCitiesByDistrict,
  getAllCities,
  getVehicleTypes,
  getVehicleMakesByType,
  getModelsByMake,
  getAllMakes,
  fetchModels,
  fetchBodyTypes,
  getTransmissionTypes,
};
