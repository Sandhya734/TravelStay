const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/Express.Error.js');
// const Review = require('../models/review.js');
const Listing = require('../models/listing.js');
const {validateReview , isLoggedIn, isReviewAuthor} = require("../middlewares.js");

const reviewController = require("../controllers/reviews.js");


// Reviews - POST route
router.post("/", 
    isLoggedIn ,
    validateReview , wrapAsync(reviewController.createReview));

//Reviews - DELETE Route
router.delete("/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.deleteReview));

module.exports = router;