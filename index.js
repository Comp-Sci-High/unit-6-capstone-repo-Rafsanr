const mongoose = require("mongoose");
const express = require("express");
const apiRoutes = require("./routes/api");

const app = express();

app.use(express.static(__dirname + "/public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method}: ${req.path}`);
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "UpToDate API is running" });
});

// API routes
app.use("/api", apiRoutes);

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

// Admin panel
app.get("/admin", (req, res) => {
  res.render("admin");
});







async function startServer() {
  await mongoose.connect("mongodb+srv://SE12:CSH2026@cluster0.ytvmkmf.mongodb.net/?appName=Cluster0");

  app.listen(3000, () => {
    console.log('Server running.');
  });

}

startServer();