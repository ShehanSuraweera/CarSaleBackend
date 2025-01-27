const app = require("./app");
const supabase = require("./config/supabase");

const PORT = process.env.PORT || 4001;

// Get the server's hostname (for Azure App Service)
const HOSTNAME = process.env.WEBSITE_HOSTNAME || `localhost:${PORT}`;

app.listen(PORT, async () => {
  console.log(`Server running on http://${HOSTNAME}`);
  try {
    const { error } = await supabase.from("users").select("*").limit(1);
    if (error) throw error;
    console.log("Database connection successful");
  } catch (err) {
    console.error("Database connection error:", err.message);
  }
});
