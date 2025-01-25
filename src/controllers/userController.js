const supabase = require("../config/supabase");

const profile = async (req, res) => {
  // Assuming the token contains the username as payload
  const { username } = req.authenticatedUser; // Retrieve the username from the validated token

  if (!username) {
    return res
      .status(400)
      .json({ error: "Invalid request, user not authenticated." });
  }

  // Query the database for user information
  try {
    const { data, error } = await supabase
      .from("users")
      .select("user_name, name, email, phone, city")
      .eq("user_name", username)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: data });
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

module.exports = { profile };
