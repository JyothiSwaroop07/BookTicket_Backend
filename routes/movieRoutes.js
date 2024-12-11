const express = require("express");
const { getMoviesByCity, getTheatresAndShowsByMovie, getLatestMoviesByCity } = require("../controllers/moviesController");
const { verifyToken } = require('../middlewares/authMiddleware')

const router = express.Router();


router.get("/city", getMoviesByCity);
router.get("/:movieId/shows", getTheatresAndShowsByMovie);

module.exports = router;