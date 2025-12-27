const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require("path");



main().then((res)=>{
    console.log("connection successful");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({ encoded:true }));   //req.params -> sparse the data from the request


app.get("/",(req,res)=>{
    res.send("Hii,I am root...!")
});

// app.get("/testListing", async(req,res)=>{
//     let samplelisting = new Listing({
//        title: "My new villa",
//        description:"By the beach",
//        price: 2000,
//        location:"Calanguta, Goa",
//        country:"India",
//     });
//     await samplelisting.save();
//     console.log("sample was save");
//     res.send("successful");
// });

//Index Route
app.get("/listings",async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
});

//Create Route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});
app.post("/listings",(req,res)=>{
  let {title,description,image,price, country,location}=req.body;
  let newList=new Listing({
    title:title,
    description:description,
    image:image,
    price:price,
    country:country,
    location:location
  });
  newList.save()
  .then((res)=>console.log(res))
  .catch((err)=>console.log(err));
  res.redirect("/listings");
});

//Show Route
app.get("/listings/:id", async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});

app.get("/listings/:id/edit", async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});

app.listen(8080,(req,res)=>{
    console.log("server is listening to port 8080");
});