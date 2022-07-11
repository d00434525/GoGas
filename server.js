// Pull in express
const express = require("express");
const app = express();

// Tell server to use json
app.use(express.json());

// Serve ui to backend
app.use(express.static(`${__dirname}/public`));

// Pull in user model
const { User } = require("./persist/model");

// Create new user
app.post("/user", async (req, res) => {
    try {
        let user = await User.create ({
            username: req.body.username,
            password: req.body.password,
        });
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({
            message: "Failed to create user",
            error: err
        });
    }
});

// Export app
module.exports = app;