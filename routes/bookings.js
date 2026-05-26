const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");

router.post("/:id", async(req,res)=>{

  const {id} = req.params;

  let listing = await Listing.findById(id);

  let checkIn = new Date(req.body.checkIn);
  let checkOut = new Date(req.body.checkOut);

  let nights = (checkOut-checkIn)/(1000*60*60*24);

  let totalPrice = nights * listing.price;

  let taxes = totalPrice * 0.05;

  let booking = new Booking({
    listing:id,
    user:req.user._id,
    checkIn,
    checkOut,
    nights,
    guests:{
      adults:req.body.adults,
      children:req.body.children,
      infants:req.body.infants,
      pets:req.body.pets
    },
    totalPrice,
    taxes
  });

  await booking.save();

  req.flash("success","Reservation Successful!");
  res.redirect(`/listings/${id}`);

});

module.exports = router;