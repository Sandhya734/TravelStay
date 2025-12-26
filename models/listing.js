const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title:{
        type:String,
        required: true,
    },
    description: String,
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bGFrZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        set:(v)=>           //if image come but it may empty
            v === "" ? "default link" : v,
    },
    price:{
        type: Number,
    },
    location:{
        type: String,
    },
    country:{
        type: String,
    },
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports= Listing;