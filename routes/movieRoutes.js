const express = require("express");
const { getMoviesByCity, getTheatresAndShowsByMovie, getSeatsByShow, getMovieDetails } = require("../controllers/moviesController");
const { verifyToken } = require('../middlewares/authMiddleware')

const router = express.Router();


router.get("/city", getMoviesByCity);
router.get("/:movieId/shows", getTheatresAndShowsByMovie);
router.get("/selectseats/:showId", getSeatsByShow);
router.get("/:movieId", getMovieDetails);

module.exports = router;