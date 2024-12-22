const express = require("express");
const { getMoviesByCity, getTheatresAndShowsByMovie, getSeatsByShow } = require("../controllers/moviesController");
const { verifyToken } = require('../middlewares/authMiddleware')

const router = express.Router();


router.get("/city", getMoviesByCity);
router.get("/:movieId/shows", getTheatresAndShowsByMovie);
router.get("/selectseats/:showId", getSeatsByShow);

module.exports = router;