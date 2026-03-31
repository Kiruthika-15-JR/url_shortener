const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("./config.json");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: "extended" }));

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));


// ================= DB =================
let rawurl = "mongodb+srv://{{dbuser}}:{{pass}}@cluster0.{{dbstring}}.mongodb.net/{{dbname}}?retryWrites=true&w=majority";

let url = rawurl
  .replace("{{dbuser}}", config.dbuser)
  .replace("{{pass}}", config.dbpass)
  .replace("{{dbstring}}", config.dbstring)
  .replace("{{dbname}}", config.dbname);

mongoose.connect(url)
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));


// ================= MODELS =================

const User = mongoose.model("User", new mongoose.Schema({
  email: { type: String, unique: true },
  password: String
}));

const Url = mongoose.model("Url", new mongoose.Schema({
  shortId: { type: String, unique: true },
  originalUrl: String,
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date
}));


// ================= JWT =================

const verifyToken = (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Please login first" });
    }

    const token = authHeader.split(" ")[1];

    req.user = jwt.verify(token, "secret");

    next();

  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};


// ================= AUTH =================

// REGISTER
app.post("/register", async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const hash = await bcrypt.hash(password, 10);

    await new User({ email, password: hash }).save();

    res.json({ message: "Registered successfully" });

  } catch (err) {

    if (err.code === 11000) {
      return res.status(400).json({ error: "User already exists" });
    }

    res.status(500).json({ error: "Server error" });
  }
});


// LOGIN
app.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id }, "secret");

    res.json({ token });

  } catch {
    res.status(500).json({ error: "Server error" });
  }
});


// ================= SHORTENER =================

app.post("/shorten", verifyToken, async (req, res) => {
  try {

    const { originalUrl, customId, expiryMinutes } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: "Please enter a URL" });
    }

    let shortId;

    // CUSTOM ID
    if (customId) {

      const exists = await Url.findOne({ shortId: customId });

      if (exists) {
        return res.status(400).json({ error: "Custom short URL already taken" });
      }

      shortId = customId;

    } else {

      // ensure unique nanoid
      let isUnique = false;

      while (!isUnique) {
        const newId = nanoid(6);

        const exists = await Url.findOne({ shortId: newId });

        if (!exists) {
          shortId = newId;
          isUnique = true;
        }
      }
    }

    // EXPIRY
    let expiresAt = null;

    if (expiryMinutes) {
      expiresAt = new Date(Date.now() + expiryMinutes * 60000);
    }

    await new Url({
      shortId,
      originalUrl,
      expiresAt
    }).save();

    res.json({
      shortUrl: `http://localhost:5000/${shortId}`
    });

  } catch (err) {

    if (err.code === 11000) {
      return res.status(400).json({ error: "Short URL already exists" });
    }

    res.status(500).json({ error: "Server error" });
  }
});


// ================= ANALYTICS =================

app.get("/analytics/:id", verifyToken, async (req, res) => {
  try {

    const url = await Url.findOne({ shortId: req.params.id });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    res.json(url);

  } catch {
    res.status(500).json({ error: "Server error" });
  }
});


// ================= REDIRECT =================

app.get("/:id", async (req, res) => {
  try {

    const url = await Url.findOne({ shortId: req.params.id });

    if (!url) {
      return res.status(404).send("URL not found");
    }

    if (url.expiresAt && url.expiresAt < new Date()) {
      return res.status(410).send("Link expired");
    }

    url.clicks++;
    await url.save();

    res.redirect(url.originalUrl);

  } catch {
    res.status(500).send("Server error");
  }
});


app.listen(5000, () => console.log("Server running on 5000"));