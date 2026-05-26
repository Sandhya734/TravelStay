if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/Express.Error.js');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user.js');
const multer  = require('multer');
const { isNotBlocked } = require("./middlewares");


const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRoutes = require("./routes/bookings");
const adminRoutes = require("./routes/admin");

// const mongoUrl = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main().then((res) => {
    console.log("connection successful");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));   //req.params -> sparse the data from the request
app.use(methodOverride("_method"));       //method-override
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static("public"));


const store =  MongoStore.create({
    mongoUrl : dbUrl,
    crypto:{
        secret : process.env.SECRETE
    },
    touchAfter : 24 * 36000,
});

store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE ", err)
});

const sessionOptions = {
    store,
    secret : process.env.SECRETE,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
        },
};

// app.get("/", (req, res) => {
//     res.send("Hii,I am root...!")
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


// use static authenticate method of model in LocalStrategy
passport.use(new localStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username });

        // ❌ User not found
        if (!user) {
            return done(null, false, { message: "Invalid username" });
        }

        // 🔴 BLOCK USER HERE
        if (user.isBlocked) {
            return done(null, false, { message: "Your account is blocked by admin" });
        }

        // ✅ Check password
        const result = await user.authenticate(password);

        if (!result.user) {
            return done(null, false, { message: "Invalid password" });
        }

        return done(null, user);

    } catch (err) {
        return done(err);
    }
}));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});



app.use("/listings", isNotBlocked, listingsRouter);
app.use("/bookings", isNotBlocked, bookingRoutes);
app.use("/admin", isNotBlocked, adminRoutes);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/",userRouter);


// 404 handler (LAST)
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

// Error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, (req, res) => {
    console.log("server is listening to port 8080");
});