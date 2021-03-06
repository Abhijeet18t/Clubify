if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
require("dotenv").config();
const jwt = require("jsonwebtoken");
const users = require("./models/users_model");
const bcrypt = require("bcrypt");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
global.appRoot = path.resolve(__dirname);
const cors = require("cors");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//database connection
var mongoDB =
    "mongodb+srv://admin:" +
    process.env.mongoDB +
    "@cluster0.hed3w.mongodb.net/WorkFlow?retryWrites=true&w=majority";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

//helpers
const authenticateToken = require("./helpers/authenticate_token");

//controllers:-
const registerUser = require("./controllers/register_user.js");
const registerClub = require("./controllers/register_club");
const fetchClubs = require("./controllers/fetch_clubs");
const fetchClubImage = require("./controllers/fetch_club_image");

//Routes

app.all('/', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
});

app.delete("/logout", (req, res) => {
    res.status(200).json("logged out");
});

app.post("/login", async (req, res) => {
    // Authenticate User
    try {
        const phone = req.body.phone;
        const password = req.body.password;
        const user = await users.findOne({ phone: phone });

        if (user == null) {
            return res.status(500).json("user not found");
        }
        if (await bcrypt.compare(password, user.hashedPassword)) {
            key = {
                username: user.userName,
                college: user.college,
                dept: user.dept,
            };
            console.log(key);
            const accessToken = jwt.sign(key, process.env.ACCESS_TOKEN_SECRET);
            return res
                .status(200)
                .json({ accessToken: accessToken, user: user });
        } else {
            return res.status(500).json("password incorrect");
        }
    } catch (error) {
        return res.status(500).json(error);
    }
});


app.get("/", (req, res) => {
    // res.render("index.ejs");
    res.status(200).send("hellowww");
});
app.post("/register", registerUser);
app.post("/registerClub", registerClub);
app.get("/fetchClubs", authenticateToken, fetchClubs);
app.get("/fetchClubImage", fetchClubImage);

app.listen(PORT);
