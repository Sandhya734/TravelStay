const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing"
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  checkIn: Date,
  checkOut: Date,

  guests: {
    adults: Number,
    children: Number,
  },

  nights: Number,
  totalPrice: Number,
  taxes: Number

}, { timestamps: true });   // ✅ CORRECT PLACE & SYNTAX

module.exports = mongoose.model("Booking", bookingSchema);