// Pull in express app
const app = require("./server");

// Pull in config
const config = require("./config");

// Pull in mongo connections
const { onConnect, connect } = require("./persist/connect");

// // Pull in authentication and authorization
const setUpAuth = require("./auth");
const setUpSession = require("./session");

// Set up authentication and authorization
setUpSession(app);
setUpAuth(app);

// Connect to mongodb and start server
onConnect (() => {
    var server = app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`);
    });
});

connect(config.dbusername, config.password);