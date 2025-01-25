const { verify } = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  const accessToken = req.cookies["access-token"];

  if (!accessToken)
    return res.status(400).json({ error: "User not Authenticated!" });

  try {
    const validToken = verify(accessToken, "secretkey");
    if (validToken) {
      req.authenticatedUser = validToken; // Attach the decoded token to the request object
      return next();
    }
  } catch (err) {
    return res.status(400).json({ error: "Invalid token!" });
  }
};

module.exports = { validateToken };
