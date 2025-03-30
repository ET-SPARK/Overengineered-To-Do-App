import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER as string,
  host: process.env.DB_HOST as string,
  database: process.env.DB_NAME as string,
  password: process.env.DB_PASSWORD as string,
  port: Number(process.env.DB_PORT), // Ensure port is converted to a number
});

// Test database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Error connecting to the database", err.stack);
  } else {
    console.log("✅ Connected to the database at", res.rows[0].now);
  }
});

export default pool;
