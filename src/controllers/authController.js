const bcrypt = require("bcrypt");
const supabase = require("../config/supabase");
const { createTokens } = require("../config/jwt");

const saltRounds = 10;

const register = async (req, res) => {
  const { email, password, name, phone, city, username } = req.body;
  if (!password || !username) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          user_name: username,
          password: hashedPassword,
          name,
          email,
          phone,
          city,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({ message: "Database error", error });
    }

    res
      .status(201)
      .json({ message: "User registered successfully", userId: data[0].id });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_name", username)
      .single();

    if (error || !data) {
      return res
        .status(401)
        .json({ message: "Invalid username. User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, data.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const accessToken = createTokens(data);
    res.cookie("access-token", accessToken, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: { ...data, password: undefined },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const logout = (req, res) => {
  res.cookie("access-token", "").json(true);
};

const userTokenVerify = async (req, res) => {
  try {
    res.status(200).json({ success: true, user: req.authenticatedUser });
  } catch (error) {
    // Catch any unexpected errors
    console.error("Error verifying token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { register, login, logout, userTokenVerify };
