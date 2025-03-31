import { Router } from "express";
import { Request, Response } from "express";
import pool from "../db"; // Import PostgreSQL pool

const router = Router();

// ✅ Get all tasks
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY date DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get a single task by ID
router.get("/:id", async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM tasks WHERE task_id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create a new task
router.post("/", async (req: Request, res: Response): Promise<any> => {
  const { title, date, completed, collection_id } = req.body;

  if (!title || !date || collection_id === undefined) {
    return res
      .status(400)
      .json({ message: "Title, date, and collection_id are required" });
  }

  try {
    const newTask = await pool.query(
      "INSERT INTO tasks (title, date, completed, collection_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, date, completed ?? false, collection_id]
    );
    res.status(201).json(newTask.rows[0]);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update a task
router.put("/:id", async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { title, date, completed, collection_id } = req.body;

  try {
    const result = await pool.query(
      "UPDATE tasks SET title = $1, date = $2, completed = $3, collection_id = $4 WHERE task_id = $5 RETURNING *",
      [title, date, completed, collection_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete a task
// router.delete(
//   "/tasks/:id",
//   async (req: Request, res: Response): Promise<any> => {
//     const { id } = req.params;

//     try {
//       const result = await pool.query(
//         "DELETE FROM tasks WHERE task_id = $1 RETURNING *",
//         [id]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({ message: "Task not found" });
//       }

//       res.json({ message: "Task deleted successfully" });
//     } catch (error) {
//       console.error("Error deleting task:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );

// 📌 Delete a Task (Automatically Deletes Subtasks)
router.delete(
  "/:task_id",
  async (req: Request, res: Response): Promise<any> => {
    const { task_id } = req.params;

    try {
      const result = await pool.query(
        "DELETE FROM tasks WHERE task_id = $1 RETURNING *",
        [task_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json({ message: "Task and its subtasks deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
