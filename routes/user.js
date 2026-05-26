const express = require('express');
const wrapAsync = require('../utils/wrapAsync');
const router = express.Router();
const User = require("../models/user");
//const passport = require('../app.js');

const userController = require("../controllers/users.js");

router
.route("/signup")
.get(userController.renderSignupForm)       //get signup form
.post(wrapAsync(userController.signup));    // singup user successfully

router
.route("/login")
.get(userController.loginForm)          // login form render
.post(userController.login);            // login user successfully

router.get("/logout",userController.logOut);

module.exports = router;