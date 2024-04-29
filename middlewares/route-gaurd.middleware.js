const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    req.payload = jwt.verify(token, process.env.SECRET_KEY);
    next();
  } catch (error) {
    console.error("Invalid token");
    res.status(401).json({ message: 'Token not provided or not valid' });
  }
}

module.exports = {
  isAuthenticated
}
