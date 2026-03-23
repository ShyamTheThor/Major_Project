// if (process.env.NODE_ENV != 'production') {
//     require("dotenv").config();
// }
// if (!process.env.ATLASDB_URL) {
//     throw new Error("ATLASDB_URL is missing. Fix your environment variables.");
// }

// const express = require('express')
// const app = express()
// const mongoose = require('mongoose')
// const path = require('path')
// const methodOverride = require('method-override')
// const ejsMate = require("ejs-mate");
// const ExpressError = require('./utils/ExpressError.js')
// const listingsRoutes = require('./routes/listing.js')
// const reviewsRoutes = require("./routes/review.js");
// const userRoutes = require("./routes/user.js");
// const session = require('express-session')
// const MongoStore = require('connect-mongo').default;
// const flash = require("connect-flash")
// const passport = require('passport')
// const LocalStrategy = require("passport-local")
// const User = require("./models/user.js")

// const dbUrl = process.env.ATLASDB_URL;

// main().then(() => {
//     console.log("Connected to database");

// }).catch((err) => {
//     console.log(err);

// })

// async function main() {

//     await mongoose.connect(dbUrl);
    
// }










// app.set("view engine", "ejs")
// app.set("views", path.join(__dirname, "views"))
// app.use(express.urlencoded({ extended: true }))
// app.use(methodOverride('_method'))
// app.engine('ejs', ejsMate)
// app.use(express.static(path.join(__dirname, '/public')))

// const store = MongoStore.create({
//     mongoUrl: dbUrl,
//     crypto:{
//         secret: process.env.SECRET,
//     },
//     touchAfter : 24*3600,
// })

// store.on("error",(err)=>{
//     console.log("Error in MONOGO STORE",err);
    
// })

// console.log("Mongo URL:", process.env.ATLASDB_URL);
// const sessionOpt = {
//     store,
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//         httpOnly: true
//     }
// };



// app.use(session(sessionOpt))
// app.use(flash())

// app.use(passport.initialize())
// app.use(passport.session())
// passport.use(new LocalStrategy(User.authenticate()))

// passport.serializeUser(User.serializeUser())
// passport.deserializeUser(User.deserializeUser())

// app.use((req, res, next) => {
//     res.locals.success = req.flash('success')
//     res.locals.error = req.flash('error')
//     res.locals.currUser = req.user;
//     next();
// })


// app.use('/listings', listingsRoutes)

// app.use("/listings/:id/reviews", reviewsRoutes)
// app.use("/", userRoutes)


// app.use((req, res, next) => {
//     next(new ExpressError(404, "Page Not Found"));
// });

// app.use((err, req, res, next) => {
//     console.error(err);

//     let { statusCode = 500, message = "Something went wrong" } = err;

//     res.status(statusCode).render("listings/error", { message, statusCode });
// });
// app.listen(8080, () => {
//     console.log('Server is listening to the respective port');
// })

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// 🔴 HARD FAIL (stop running broken app)
if (!process.env.ATLASDB_URL) {
    throw new Error("ATLASDB_URL is missing. Set it in Render environment variables.");
}
if (!process.env.SECRET) {
    throw new Error("SECRET is missing. Set it in Render environment variables.");
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listingsRoutes = require("./routes/listing.js");
const reviewsRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");

const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const dbUrl = process.env.ATLASDB_URL;

// 🔥 DB + SERVER BOOTSTRAP
async function main() {
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to MongoDB");

    // ✅ Mongo Store (after DB connect)
    const store = MongoStore.create({
        mongoUrl: dbUrl,
        crypto: {
            secret: process.env.SECRET,
        },
        touchAfter: 24 * 3600,
    });

    store.on("error", (err) => {
        console.log("❌ Mongo Store Error:", err);
    });

    // 🔧 Express config
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.engine("ejs", ejsMate);

    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride("_method"));
    app.use(express.static(path.join(__dirname, "public")));

    // 🔐 Session config
    app.use(
        session({
            store,
            secret: process.env.SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            },
        })
    );

    app.use(flash());

    // 🔐 Passport config
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    // 🔁 Global variables
    app.use((req, res, next) => {
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        res.locals.currUser = req.user;
        next();
    });

    // 📦 Routes
    app.use("/listings", listingsRoutes);
    app.use("/listings/:id/reviews", reviewsRoutes);
    app.use("/", userRoutes);

    // ❌ 404 handler
    app.use((req, res, next) => {
        next(new ExpressError(404, "Page Not Found"));
    });

    // ❌ Error handler
    app.use((err, req, res, next) => {
        console.error(err);
        let { statusCode = 500, message = "Something went wrong" } = err;
        res.status(statusCode).render("listings/error", { message, statusCode });
    });

    // 🚀 Start server (Render-compatible)
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

// 🔥 Run app
main().catch((err) => {
    console.error("❌ Failed to start app:", err);
});