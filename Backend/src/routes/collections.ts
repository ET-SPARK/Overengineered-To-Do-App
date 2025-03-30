import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();

// Get all collections
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM collections");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a new collection
router.post("/", async (req: Request, res: Response): Promise<any> => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO collections (name) VALUES ($1) RETURNING *",
      [name]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
