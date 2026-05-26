const Listing = require("./models/listing");
const { listingSchema } = require('./schema.js');
const ExpressError = require('./utils/Express.Error.js');
const {  reviewSchema } = require('./schema.js');
const Review = require("./models/review.js");


// middleware.js

module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    req.flash("error", "Access Denied!");
    return res.redirect("/listings");
  }
  next();
};


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        return res.redirect("/login");
    }
    next();
};

module.exports.isNotBlocked = (req, res, next) => {
    try {
        if (req.user && req.user.isBlocked) {
            req.logout((err) => {
                if (err) return next(err);
                console.log("User:", req.user);
                req.flash("error", "Your account is blocked");
                return res.redirect("/login");
            });
        } else {
            next();
        }
    } catch (err) {
        next(err);
    }
};

module.exports.isOwner = async (req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
      req.flash("error" , "You are not the Owner of this listing");
      return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req,res,next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
      req.flash("error" , "You are not the Author of this review");
      return res.redirect(`/listings/${id}`);
    }
    next();
}