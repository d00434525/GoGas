// Pull in passport
const passport = require("passport");

// Pull in passport local strategy
const LocalStrategy = require("passport-local");

// Pull in user model
const { User } = require("./persist/model");

// Pull in bcrypt
const bcrypt = require("bcrypt");

// Tell passport to use the local strategy
passport.use(new LocalStrategy(async (username, password, done) => {
    let user;
    try {
        user = await User.findOne({"email": email});
        if (!user) {
            return done(null, false);
        }
        const verifiedPassword = await bcrypt.compare(password, user.password);
        if (!verifiedPassword) {
            return done(null, false);
        } else {
            return done(null, user);
        }
    } catch (err) {
        return done(err);
    }
}));

// Set up authentication function
const setUpAuth = function (app) {
    app.use(passport.initialize());
    app.use(passport.authenticate("session"));

    passport.serializeUser(function (user, callback) {
        callback(null, {id: user._id, username: user.email, password: user.password});
    });

    passport.deserializeUser(function (user, callback){
        return callback(null, user);
    });

    app.post("/login", passport.authenticate("local"), (req,res) => {
        res.status(201).json({message: "Successfully Authenticated", id: req.user.id});
    });

    app.get("/login", (req, res) => {
        if (!req.user) {
            res.status(401).json({message: "Unauthorized"});
            return
        }
        res.status(200).json({message: "Authorized", id: req.user.id, email: req.user.email, password: req.user.password});
    });
}

// Export authentication setup
module.exports = setUpAuth