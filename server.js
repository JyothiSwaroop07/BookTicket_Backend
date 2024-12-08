require("dotenv").config();  // Load environment variables
const app = require("./app"); // Import Express app

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
