const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// const session = require("express-session");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adRoutes = require("./routes/adRoutes");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://car-sale-pzbrsc9w8-shehan-suraweeras-projects.vercel.app",
      "https://car-sale-dev.vercel.app",
      "http://192.168.8.133:3000",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(
//   session({
//     key: "userId",
//     secret: "your-secret-key",
//     resave: false,
//     saveUninitialized: false,
//     cookie: { expires: 24 * 60 * 60 * 1000 },
//   })
// );

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/uploads", adRoutes);

module.exports = app;
