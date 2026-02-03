const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({
  path: __dirname + "/.env",
});
const connectDb = require("./config/db");
const authRoutes = require("./routes/auth_routes");
const postRoutes = require("./routes/post_routes");
const commentRoutes = require("./routes/comment_routes");
const { toggleLike } = require("./controllers/post_controller");
const auth = require("./middleware/auth");
const profileRoutes = require("./routes/profile_routes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDb();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "LibZo Backend is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
