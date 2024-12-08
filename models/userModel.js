const pool = require("../config/dbConfig");

// Add a new user
const createUser = async (firstname, lastname, email, hashedPassword, phone, location) => {
  return pool.query(
    "INSERT INTO Users (firstname, lastname, email, password_hash, phone, location) VALUES ($1, $2, $3, $4, $5, $6)",
    [firstname, lastname, email, hashedPassword, phone, location]
  );
};

// Find a user by email
const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM Users WHERE email = $1", [email]);
  return result.rows[0];
};

module.exports = { createUser, findUserByEmail };
