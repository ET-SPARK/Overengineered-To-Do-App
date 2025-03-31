import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();

// 📌 Create a Subtask
router.post("/", async (req: Request, res: Response): Promise<any> => {
  const { task_id, title, date, completed } = req.body;

  if (!task_id || !title) {
    return res.status(400).json({ message: "task_id and title are required" });
  }

  try {
    const newSubtask = await pool.query(
      "INSERT INTO subtasks (task_id, title, date, completed) VALUES ($1, $2, $3, $4) RETURNING *",
      [task_id, title, date || new Date(), completed ?? false]
    );
    res.status(201).json(newSubtask.rows[0]);
  } catch (error) {
    console.error("Error creating subtask:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Get All Subtasks
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM subtasks ORDER BY date DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Get a Single Subtask by ID
router.get(
  "/:subtask_id",
  async (req: Request, res: Response): Promise<any> => {
    const { subtask_id } = req.params;

    try {
      const result = await pool.query(
        "SELECT * FROM subtasks WHERE subtask_id = $1",
        [subtask_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Subtask not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching subtask:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// 📌 Update a Subtask
router.put(
  "/:subtask_id",
  async (req: Request, res: Response): Promise<any> => {
    const { subtask_id } = req.params;
    const { title, date, completed } = req.body;

    try {
      const result = await pool.query(
        "UPDATE subtasks SET title = $1, date = $2, completed = $3 WHERE subtask_id = $4 RETURNING *",
        [title, date || new Date(), completed, subtask_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Subtask not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating subtask:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// 📌 Delete a Subtask
router.delete(
  "/:subtask_id",
  async (req: Request, res: Response): Promise<any> => {
    const { subtask_id } = req.params;

    try {
      const result = await pool.query(
        "DELETE FROM subtasks WHERE subtask_id = $1 RETURNING *",
        [subtask_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Subtask not found" });
      }

      res.json({ message: "Subtask deleted successfully" });
    } catch (error) {
      console.error("Error deleting subtask:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
