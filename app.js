const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require("path");
const methodOverride = require('method-override');
//const ejsMate = require('ejsMate');



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
app.use(express.urlencoded({ extended:true }));   //req.params -> sparse the data from the request
app.use(methodOverride("_method"));       //method-override
//app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



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

//New Route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});
//Create Route
app.post("/listings",async (req,res)=>{
  //let {title,description,image,price, country,location}=req.body;
//   let newListing = req.body.Listing;
  const newListing = new Listing(req.body.listing);
  console.log(newListing);
  await newListing.save().then((res)=>console.log(res));
  res.redirect("/listings");
});

//Show Route
app.get("/listings/:id", async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});

//Edit Route
app.get("/listings/:id/edit", async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});
//Update Route
app.put("/listings/:id",async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing});
    res.redirect(`/listings/${id}`);
});

//DELETE Route
app.delete("/listings/:id", async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})

app.listen(8080,(req,res)=>{
    console.log("server is listening to port 8080");
});