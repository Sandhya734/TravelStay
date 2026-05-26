const Listing = require("../models/listing");
const axios = require("axios");
const Booking = require("../models/booking");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.createNewListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    try {
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: newListing.location,
                    format: "json",
                    limit: 1
                },
                headers: {
                    "User-Agent": "WanderLustApp (sandhya@gmail.com)" // required
                }
            }
        );

        if (response.data.length > 0) {
            newListing.latitude = parseFloat(response.data[0].lat);
            newListing.longitude = parseFloat(response.data[0].lon);
        } else {
            // fallback (optional)
            newListing.latitude = 19.8762;
            newListing.longitude = 75.3433;
        }

    } catch (err) {
        console.log("Geocoding error:", err.message);

        // fallback if error
        newListing.latitude = 19.8762;
        newListing.longitude = 75.3433;
    }

    // try {
    //     await newListing.save();
    //     req.flash("success", "New Listing is created !");
    //     res.redirect("/listings");
    // } catch (err) {
    //     console.log(err);
    //     res.send("Error saving listing");
    // }

    await newListing.save();

    req.flash("success", "New Listing is created !");
    res.redirect("/listings");
};


module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate('owner')           // host info
        .populate({
            path: 'reviews',
            populate: { path: 'author' } // ensures author inside reviews is populated
        });

    // 🔒 Safety check
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    const bookings = await Booking.find({ listing: id });

    let bookedDates = [];

    bookings.forEach(b => {
        let start = new Date(b.checkIn);
        let end = new Date(b.checkOut);

        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            bookedDates.push(new Date(d).toISOString().split("T")[0]);
        }
    });


    res.render("listings/show.ejs", { listing, bookedDates, currUser: req.user });
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist !");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250")
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
    }
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Listing Updated !");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted !");
    res.redirect("/listings");
};

module.exports.reserveListing = async (req, res) => {
    const { id } = req.params;

    let listing = await Listing.findById(id);
    const bookings = await Booking.find({ listing: id });

    let bookedDates = [];

    bookings.forEach(b => {
        let start = new Date(b.checkIn);
        let end = new Date(b.checkOut);

        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            bookedDates.push(new Date(d).toISOString().split("T")[0]);
        }
    });

    res.render("listings/reserve.ejs", { listing, bookedDates });
};