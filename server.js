// Pull in express
const express = require("express");
const app = express();

// Tell server to use json
app.use(express.json());

// Serve ui to backend
app.use(express.static(`${__dirname}/public`));

// Pull in user and station model
const { User, Station } = require("./persist/model");

// // Pull in authentication and authorization
const setUpAuth = require("./auth");
const setUpSession = require("./session");

// Set up authentication and authorization
setUpSession(app);
setUpAuth(app);

// Create new user
app.post("/user", async (req, res) => {
    try {
        let user = await User.create ({
            username: req.body.username,
            password: req.body.password,
            name: req.body.name,
            zip: req.body.zip,
        });
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({
            message: "Failed to create user",
            error: err
        });
    }
});

// Get all gas stations
app.get("/stations", async (req, res) => {
    let allStations = [];
    try {
        allStations = await Station.find({}, "-reviews");
    } catch (err) {
        res.status(500).json({
            message: "Failed to get stations",
            error: err
        });
    }

    res.status(200).json(allStations);
});

// Get gas station by id
app.get("/station/:id", async (req, res) => {
    let station;
    // Get station by id
    try {
        station = await Station.findById(req.params.id);
        if (!station) {
            res.status(404).json({
                message: "station not found"
            });
            return;
        }
    } catch (err) {
        res.status(500).json({
            message: `get request failed to get station`,
            error: err,
        });
        return;
    }
    res.status(200).json(station)
});

// Post new gas station
app.post("/station", async (req, res) => {
    // Check auth
    if (!req.user) {
        res.status(401).json({message: "Unauthorized"});
        return;
    }

    // Create new station
    try {
        let station = await Station.create({
            name: req.body.name,
            address: req.body.address,
            stationType: req.body.stationType,
            pumpHours: req.body.pumpHours,
        });
        res.status(201).json(station)
    } catch (err) {
        res.status(500).json({message: "Failed to create station"}, err)
    }
});

// Post new review on a station
app.post("/review", async (req, res) => {
    // Check auth
    if (!req.user) {
        res.status(401).json({message: "Unauthorized"});
        return;
    }

    let station;

    try {
        station = await Station.findByIdAndUpdate(
            req.body.station_id,
            {
                $push: {
                    reviews: {
                        user_id: req.user.id,
                        rating: req.body.rating,
                        comment: req.body.comment,
                        station_id: req.body.station_id
                    },
                }
            },
            {
                new: true,
            });
            if (!station) {
                res.status(500).json({
                    message: `get request failed to get station`,
                    error: err,
                });
                return;
            }
        res.status(201).json(station.reviews[station.reviews.length - 1])
    } catch (err) {
        res.status(500).json({message: "Failed to create review"}, err)
    }
});

// Post price on a station
app.post("/price", async (req, res) => {
    // Check auth
    if (!req.user) {
        res.status(401).json({message: "Unauthorized"});
        return;
    }

    let station;

    try {
        station = await Station.findByIdAndUpdate(
            req.body.station_id,
            {
                $push: {
                    prices: {
                        user_id: req.user.id,
                        price: req.body.price,
                        station_id: req.body.station_id
                    },
                }
            },
            {
                new: true,
            });
            if (!station) {
                res.status(500).json({
                    message: `get request failed to get station`,
                    error: err,
                });
                return;
            }
        res.status(201).json(station.prices[station.prices.length - 1])
    } catch (err) {
        res.status(500).json({message: "Failed to create price"}, err)
    }
});

// Delete review from station if user is owner
app.delete("/station/:station_id/review/:review_id", async (req, res) => {
    // check auth
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
  
    let station;
    let review;
  
    // pull thread
    try {
      station = await Station.findOne({
        _id: req.params.station_id,
        "reviews._id": req.params.review_id,
      });
    } catch (err) {
      res.status(500).json({
        message: `error finding review when deleting post`,
        error: err,
      });
      return;
    }
  
    if (!station) {
      res.status(404).json({
        message: `station not found when deleting post`,
        station_id: req.params.station_id,
        review_id: req.params.review_id,
      });
      return;
    }

    let isSameUser = false;
    for (let k in station.reviews) {
      if (station.reviews[k]._id == req.params.review_id) {
        review = station.reviews[k];
        if (station.reviews[k].user_id == req.user.id) {
          isSameUser = true;
        }
      }
    }
  
    if (!isSameUser) {
      res.status(403).json({ mesage: "Unauthorized" });
      return;
    }
  
    // delete the post
    try {
      await Station.findByIdAndUpdate(req.params.station_id, {
        $pull: {
          reviews: {
            _id: req.params.review_id,
          },
        },
      });
    } catch (err) {
      res.status(500).json({
        message: `error deleting review`,
        error: err,
      });
      return;
    }
  
    // return the deleted post
    res.status(200).json(review);
});

// Export app
module.exports = app;