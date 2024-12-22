const pool = require("../config/dbConfig");

exports.getMoviesByCity = async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: "City parameter is required." });
  }

  try {
    const query = `
      SELECT DISTINCT
        m.id AS movie_id,
        m.title AS movie_title,
        m.genre,
        m.release_date,
        m.poster_url
      FROM Movies m
      JOIN Shows s ON s.movie_id = m.id
      JOIN Screens scr ON s.screen_id = scr.id
      JOIN Theaters t ON scr.theater_id = t.id
      WHERE t.location = $1
      ORDER BY m.id;
    `;

    const result = await pool.query(query, [city]);

    const movies = result.rows.map(row => ({
      id: row.movie_id,
      title: row.movie_title,
      genre: row.genre,
      release_date: row.release_date,
      poster_url: row.poster_url,
    }));

    res.status(200).json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching movies." });
  }
};

exports.getTheatresAndShowsByMovie = async (req, res) => {
  const { movieId } = req.params; // Extract movieId from route parameters
  const { city } = req.query;    // Extract city from query parameters

  if (!movieId || !city) {
    return res.status(400).json({ error: "Movie ID and City parameters are required." });
  }

  try {
    const query = `
      SELECT 
        m.title AS movie_name,
        t.id AS theatre_id,
        t.name AS theatre_name,
        scr.id AS screen_id,
        scr.name AS screen_name,
        s.id AS show_id,
        s.start_time,
        s.end_time,
        json_agg(DISTINCT jsonb_build_object(
          'category', ss.category,
          'price', ss.price
        )) AS prices,
        COALESCE(
          (SELECT ROUND((COUNT(CASE WHEN ss1.status = 'available' THEN 1 END) * 100.0) / COUNT(*), 2)
           FROM ShowSeats ss1
           WHERE ss1.show_id = s.id), 
          0
        ) AS availability_percentage
      FROM Movies m
      JOIN Shows s ON m.id = s.movie_id
      JOIN Screens scr ON s.screen_id = scr.id
      JOIN Theaters t ON scr.theater_id = t.id
      JOIN ShowSeats ss ON ss.show_id = s.id
      WHERE s.movie_id = $1 AND t.location = $2
      GROUP BY 
        m.title, t.id, t.name, scr.id, scr.name, s.id, s.start_time, s.end_time
      ORDER BY t.id, s.start_time;
    `;

    const result = await pool.query(query, [movieId, city]);

    let movieName = null;

    const theatres = result.rows.reduce((acc, row) => {
      const {
        movie_name,
        theatre_id,
        theatre_name,
        screen_id,
        screen_name,
        show_id,
        start_time,
        end_time,
        prices,
        availability_percentage,
      } = row;

      // Capture movie name from the first row
      if (!movieName) {
        movieName = movie_name;
      }

      // Check if the theatre already exists in the response
      let theatre = acc.find((t) => t.id === theatre_id);
      if (!theatre) {
        theatre = {
          id: theatre_id,
          name: theatre_name,
          shows: [],
        };
        acc.push(theatre);
      }

      // Add the show directly to the theatre's shows array
      theatre.shows.push({
        id: show_id,
        start_time,
        end_time,
        screen: {
          id: screen_id,
          name: screen_name,
        },
        prices, // Include prices in the response
        availability_percentage, // Include availability percentage
      });

      return acc;
    }, []);

    res.status(200).json({ movieName, theatres });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching theatres and shows." });
  }
};

exports.getSeatsByShow = async (req, res) => {
  const { showId } = req.params; // Extract showId from route parameters

  if (!showId) {
    return res.status(400).json({ error: "Show ID is required." });
  }

  try {
    // Query to get seat details along with movie, theater, and screen details
    const query = `
      SELECT 
          ss.id AS seat_id,
          ss.seat_number,
          ss.status,
          ss.price,
          ss.category,
          m.title AS movie_name,
          m.poster_url,
          sh.start_time,
          t.name AS theatre_name,
          s.name AS screen_name
      FROM ShowSeats ss
      JOIN Shows sh ON ss.show_id = sh.id
      JOIN Movies m ON sh.movie_id = m.id
      JOIN Screens s ON sh.screen_id = s.id
      JOIN Theaters t ON s.theater_id = t.id
      WHERE ss.show_id = $1
      ORDER BY ss.id;
    `;

    const result = await pool.query(query, [showId]);

    // If no seats are found, return an empty array with movie details as null
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        movie_details: null, 
        seats: [] 
      });
    }

    // Extract movie details from the first row
    const movieDetails = {
      movie_name: result.rows[0].movie_name,
      poster_url: result.rows[0].poster_url,
      theatre_name: result.rows[0].theatre_name,
      screen_name: result.rows[0].screen_name,
      start_time: result.rows[0].start_time,
    };

    // Extract seat details
    const seats = result.rows.map(row => ({
      seat_id: row.seat_id,
      seat_number: row.seat_number,
      status: row.status,
      price: row.price,
      category: row.category,
    }));

    // Return the combined data
    res.status(200).json({
      movie_details: movieDetails,
      seats: seats,
    });
  } catch (error) {
    console.error("Error fetching seats for the show:", error);
    res.status(500).json({ error: "Error fetching seats for the show." });
  }
};


