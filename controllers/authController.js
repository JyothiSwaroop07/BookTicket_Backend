const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const register = async (req, res) => {
  const { firstname, lastname, email, password_hash, phone, location } = req.body;

  try {
    const user = await userModel.findUserByEmail(email);
    if (user) {
      return res.status(404).send({ error: "User already exixts" });
    }
    const hashedPassword = await bcrypt.hash(password_hash, 10);
    await userModel.createUser(firstname, lastname, email, hashedPassword, phone, location);
    res.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error registering user" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).send({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).send({ token, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error logging in" });
  }
};

module.exports = { register, login };
