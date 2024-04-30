const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middlewares/route-gaurd.middleware");

// Sign up route
router.post("/signup", async (req, res, next) => {
  const { password, ...userData } = req.body;
  try {
    const salt = bcryptjs.genSaltSync(13);
    userData.passwordHash = bcryptjs.hashSync(password, salt);
    const newUser = await User.create(userData);
    const { passwordHash, ...user } = newUser._doc;
    res.status(201).json(user);
  } catch (error) {
    console.error("Error while signing up user: ", userData);
    next(error);
  }
});

// Login route
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const userData = await User.findOne({ email });
    if (userData && bcryptjs.compareSync(password, userData.passwordHash)) {
      const token = jwt.sign({ id: userData._id }, process.env.SECRET_KEY, { algorithm: "HS256", expiresIn: "1h" });
      res.status(200).json({ token });
    } else {
      res.status(401).json({ message: "Email or password is incorrect." });
    }
  } catch (error) {
    console.error("Error while login user: ", email);
    next(error);
  }
});

// Verify token route
router.get("/verify", isAuthenticated, (req, res) => {
  res.status(200).json(req.payload);
})

module.exports = router;