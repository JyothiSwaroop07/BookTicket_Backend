const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const {verifyToken} = require("./middlewares/authMiddleware")

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/movies", movieRoutes);

app.use(require("./middlewares/errorHandler"));

module.exports = app;
