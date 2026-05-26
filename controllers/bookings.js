const Booking = require("../models/booking");

module.exports.createBooking = async (req, res) => {
    const { listingId } = req.params;
    const { checkIn, checkOut } = req.body;

    const today = new Date();
    today.setHours(0,0,0,0);

    // ❌ Prevent past dates
    if (new Date(checkIn) < today) {
        req.flash("error", "Cannot book past dates");
        return res.redirect(`/listings/${listingId}`);
    }

    // ❌ Prevent invalid range
    if (new Date(checkOut) <= new Date(checkIn)) {
        req.flash("error", "Check-out must be after check-in");
        return res.redirect(`/listings/${listingId}`);
    }

    // 🔥 Check overlapping bookings
    const existingBookings = await Booking.find({
        listing: listingId,
        $or: [
            {
                checkIn: { $lt: new Date(checkOut) },
                checkOut: { $gt: new Date(checkIn) }
            }
        ]
    });

    if (existingBookings.length > 0) {
        req.flash("error", "These dates are already booked");
        return res.redirect(`/listings/${listingId}`);
    }

    // ✅ Create booking
    const newBooking = new Booking({
        listing: listingId,
        user: req.user._id,
        checkIn,
        checkOut
    });

    await newBooking.save();

    req.flash("success", "Booking successful!");
    res.redirect("/reserve.ejs");
};