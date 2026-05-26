const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require('../models/listing.js');
const {isLoggedIn , isOwner,validateListing} = require("../middlewares.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");


// INDEX + CREATE
router.route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn, upload.single('listing[image]'), 
   validateListing, 
   wrapAsync(listingController.createNewListing));


// NEW
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});


// ABOUT
router.get("/about", (req, res) => {
    res.render("listings/about.ejs");
});


// ✅ SEARCH (KEEP HERE — BEFORE :id)
router.get("/search", async (req, res) => {
    let { location } = req.query;

    try {
        const allListings = await Listing.find({
            location: { $regex: location, $options: "i" }
        });

        res.render("listings/index.ejs", { allListings }); 
    } catch (err) {
        console.log(err);
        res.redirect("/listings");
    }
});


// SHOW + UPDATE + DELETE
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));


// EDIT
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));


// RESERVE
router.get("/:id/reserve", isLoggedIn, wrapAsync(listingController.reserveListing));

module.exports = router;