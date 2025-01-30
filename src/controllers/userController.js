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
      .select("*")
      .eq("id", user_id);
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

module.exports = { profile };
