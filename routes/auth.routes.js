//Module Imports
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

//MidlleWare Imports
const { isAuthenticated } = require("../middlewares/route-gaurd.middleware");

//Models
const User = require("../models/User.model");

//Variables
const saltCount = 13;

// Sign up route
router.post("/signup", async (req, res, next) => {
  const { password, ...userData } = req.body;
  try {
    const salt = bcrypt.genSaltSync(saltCount);
    userData.passwordHash = bcrypt.hashSync(password, salt);
    const newUser = await User.create(userData);
    const { passwordHash, ...user } = newUser._doc;
    res.status(201).json({ message: "success", data: user });
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
    if (userData && bcrypt.compareSync(password, userData.passwordHash)) {
      const token = jwt.sign({ id: userData._id }, process.env.SECRET_KEY, {
        algorithm: "HS256",
        expiresIn: "1h",
      });
      res.status(200).json({ message: "success", data: { token } });
    } else {
      res.status(401).json({ message: "Email or password is incorrect." });
    }
  } catch (error) {
    console.error("Error while login user: ", email);
    next(error);
  }
});

//Forgot Password Route
router.post("/forgot-password", async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "5m",
    });

    // Send reset password email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: "brainbash.jfk@gmail.com",
      to: email,
      subject: "Password Reset",
      html: `<p>You can reset your password <a href="${process.env.CLIENT_URL}/reset-password/${token}">here</a></p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);

    res.status(200).json();
  } catch (err) {
    next(err);
  }
});

// Reset password route
router.post("/reset-password/:token", async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltCount);
    user.passwordHash = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    next(err);
  }
});

// Verify token route
router.get("/verify", isAuthenticated, (req, res) => {
  res.status(200).json({ message: "success", data: req.payload });
});

module.exports = router;
