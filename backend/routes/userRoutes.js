const express = require("express");
const router = express.Router();
const controllers = require("../controllers/userControllers");

// Routes
router.post('/register', controllers.registerUser);
router.post('/login', controllers.loginUser);
router.post('/otp', controllers.verifyOtp);


module.exports = router;