const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const CONNECTION_STRING = "mongodb://localhost:27017"; // MongoDB local
const DATABASENAME = "MyDb";
let database;

// Middleware: DB must be connected
app.use((req, res, next) => {
  if (!database) return res.status(503).json({ error: "Database not connected yet." });
  next();
});

async function start() {
  try {
    const client = new MongoClient(CONNECTION_STRING, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    await client.connect();
    database = client.db(DATABASENAME);
    console.log("Connected to MongoDB");

    // Serve Angular build folder
    app.use(express.static(path.join(__dirname, 'dist/fitness-tracker')));

    // Fallback route: serve Angular index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist/fitness-tracker/index.html'));
    });

    app.listen(5038, () => console.log("Server running on http://localhost:5038"));
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}
start();

// ------------------ API ROUTES ------------------

// Get all exercises
app.get("/api/exercises/GetExercises", async (req, res) => {
  try {
    const result = await database.collection("exercises").find({}).toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch exercises" });
  }
});

// Add exercise
app.post("/api/exercises/AddExercise", multer().none(), async (req, res) => {
  try {
    const numOfDocs = await database.collection("exercises").countDocuments();
    await database.collection("exercises").insertOne({
      id: String(numOfDocs + 1),
      exerciseName: req.body.exerciseName,
      type: req.body.type,
      duration: Number(req.body.duration) || 0,
      caloriesBurned: Number(req.body.caloriesBurned) || 0,
    });
    res.json("Exercise added successfully!");
  } catch (error) {
    res.status(500).json({ error: "Failed to add exercise" });
  }
});

// Delete exercise
app.delete("/api/exercises/DeleteExercise", async (req, res) => {
  try {
    await database.collection("exercises").deleteOne({ id: req.query.id });
    res.json("Deleted successfully!");
  } catch (error) {
    res.status(500).json({ error: "Failed to delete exercise" });
  }
});