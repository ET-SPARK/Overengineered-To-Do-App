import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db";
import collectionRoutes from "../src/routes/collections";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Check database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed:", err.stack);
  } else {
    console.log("✅ Connected to the database at:", res.rows[0].now);
  }
});

// Define a test route to check if the server is running
app.get("/", (req, res) => {
  res.send("Hello, Task Manager API!");
});

app.use("/collections", collectionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
