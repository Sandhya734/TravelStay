const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
   isAdmin: {
    type: Boolean,
    default: false,
  },
   isBlocked: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(passportLocalMongoose); // ✅ must pass function

module.exports = mongoose.model("User", userSchema);