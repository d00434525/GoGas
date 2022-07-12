// Pull in mongoose
const mongoose = require("mongoose");

// Pull in bcrypy
const bcrypt = require("bcrypt");

// User schema
const userSchema = mongoose.Schema({
    username: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please fill a valid email address",
        ],
        required: true,
        unique: true,
    },
    password: { type: String, required: true },
    name: { type: String, required: true, unique: true},
    zip: { type: Number, required: true},
});

// Encrypt password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    try {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
        next();
    }
    catch (err) {
        next(err);
    }
}
);

// Model user schema
const User = mongoose.model("User", userSchema);

// Export user model
module.exports = {
    User
}