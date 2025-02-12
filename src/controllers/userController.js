const supabase = require("../config/supabase");

const profile = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "Invalid request" });
  }
  // Query the database for user information
  try {
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("*, cities!inner(id,name, districts!inner(id,name))")
      .eq("id", user_id)
      .single();
    if (userError) {
      return res
        .status(500)
        .json({ error: "Database error", message: userError.message });
    }

    res.status(200).json({ user: userData });
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

const updateProfile = async (req, res) => {
  const { user_id, name, phone, city, avatar_url } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID required" });
  }

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        name: name,
        phone: phone,
        city: city,
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

module.exports = {
  profile,
  updateProfile,
};
