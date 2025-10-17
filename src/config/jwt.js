const { sign } = require("jsonwebtoken");

const createTokens = (user) => {
  const accessToken = sign({ username: user.user_name }, "secretkey", {
    expiresIn: "1h",
  });
  return accessToken;
};

module.exports = { createTokens };
