const mongoose = require("mongoose");
const axios = require("axios");

const Listing = require("./models/listing");

// connect DB
mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

// delay function (IMPORTANT)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateAllListings() {
  const listings = await Listing.find({});

  for (let listing of listings) {
    try {
      console.log("Updating:", listing.title);

      const res = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: listing.location,
            format: "json",
            limit: 1
          },
          headers: {
            "User-Agent": "WanderLustApp (sandhya@gmail.com)" // REQUIRED ✅
          }
        }
      );

      if (res.data.length > 0) {
        listing.latitude = parseFloat(res.data[0].lat);
        listing.longitude = parseFloat(res.data[0].lon);

        await listing.save();
        console.log("✅ Updated:", listing.title);
      } else {
        console.log("❌ Not found:", listing.location);
      }

      await delay(1000); // ⏳ VERY IMPORTANT (1 sec gap)

    } catch (err) {
      console.log("Error:", err.message);
    }
  }

  console.log("🎉 All listings updated!");
  mongoose.connection.close();
}

updateAllListings();