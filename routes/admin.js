// routes/admin.js

const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Booking = require("../models/booking"); // ✅ correct naming
const { isAdmin } = require("../middlewares");
// ✅ Protect ALL routes
router.use(isAdmin);



// Admin Dashboard
router.get("/dashboard", isAdmin, async (req, res) => {
  const users = await User.find({});

  const bookings = await Booking.find({})
    .populate("user")
    .populate("listing"); // if you have listing reference

  res.render("admin/dashboard", { users, bookings });
});

router.delete("/users/:id/delete", async (req, res) => {
    const { id } = req.params;

    if (req.user._id.equals(id)) {
        req.flash("error", "You cannot delete yourself!");
        return res.redirect("/admin/dashboard");
    }

    await User.findByIdAndDelete(id);
    res.redirect("/admin/dashboard");
});

router.put("/users/:id/block", async (req, res) => {
    const { id } = req.params;

    if (req.user._id.equals(id)) {
        req.flash("error", "You cannot block yourself!");
        return res.redirect("/admin/dashboard");
    }

    let user = await User.findById(id);
    user.isBlocked = !user.isBlocked;

    await user.save();
    res.redirect("/admin/dashboard");
});

// 🔴 Delete User
router.delete("/users/:id/delete", async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.redirect("/admin/dashboard");
});

// 🟡 Block / Unblock User
router.put("/users/:id/block", async (req, res) => {
    const { id } = req.params;

    let user = await User.findById(id);
    user.isBlocked = !user.isBlocked;   // toggle

    await user.save();
    res.redirect("/admin/dashboard");
});

module.exports = router;