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
        s.price
      FROM Movies m
      JOIN Shows s ON m.id = s.movie_id
      JOIN Screens scr ON s.screen_id = scr.id
      JOIN Theaters t ON scr.theater_id = t.id
      WHERE s.movie_id = $1 AND t.location = $2
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
        price,
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
        price,
        screen: {
          id: screen_id,
          name: screen_name,
        },
      });

      return acc;
    }, []);

    res.status(200).json({ movieName, theatres });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching theatres and shows." });
  }
};