function errorHandler(err, req, res, next) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
  
  module.exports = errorHandler;
  