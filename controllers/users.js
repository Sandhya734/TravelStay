const User = require("../models/user");
const passport = require("passport");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });

        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);   // ✅ FIXED
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.loginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res, next) => {
    const { username } = req.body;

    const user = await User.findOne({ username });

    if (user && user.isBlocked) {
        req.flash("error", "Your account is blocked by admin");
        return res.redirect("/login");
    }

    const redirectUrl = req.session.redirectUrl;

    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    })(req, res, () => {

        req.flash("success", "Welcome back!");

        if (redirectUrl) {
            delete req.session.redirectUrl;
            return res.redirect(redirectUrl);
        }

        res.redirect("/listings");
    });
};

module.exports.logOut = (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);   // ✅ FIXED
        }
        req.flash('success', "You are logged Out");
        res.redirect("/listings");
    });
};