// // Pull in express session
// const session = require("express-session");

// // Pull in config
// const config = require("./config");

// // Set up session store function
// const setUpSessionStore = function (app) {
//     app.use(session({
//         secret: config.secret,
//         resave: false,
//         saveUninitialized: false,
//     }));
// }

// // Export set up session store
// module.exports = setUpSessionStore