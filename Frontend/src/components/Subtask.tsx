import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
    useGetSubtasksQuery,
    useAddSubtaskMutation,
    useUpdateSubtaskMutation,
    useDeleteSubtaskMutation
} from "@/redux/apiSlice"; // Adjust the path as needed
import { Checkbox } from "./ui/checkbox"; // Import the custom Checkbox component

const SubtaskForm = () => {
    const { id } = useParams<{ id: string }>(); // Get taskId from URL params
    const [title, setTitle] = useState("");
    const [editId, setEditId] = useState<number | null>(null);
    const [message, setMessage] = useState("");

    // API Hooks
    const { data: subtasks, isLoading: isFetching } = useGetSubtasksQuery(); // Fetch all subtasks
    const [addSubtask, { isLoading: isAdding }] = useAddSubtaskMutation();
    const [updateSubtask, { isLoading: isUpdating }] = useUpdateSubtaskMutation();
    const [deleteSubtask] = useDeleteSubtaskMutation();

    // Filter subtasks by taskId
    const filteredSubtasks = subtasks?.filter((subtask: { task_id: number }) => subtask.task_id === parseInt(id, 10));

    // Handle Submit (Create or Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !title) {
            setMessage("Task ID and Title are required.");
            return;
        }

        try {
            if (editId) {
                // Update existing subtask
                await updateSubtask({ subtask_id: editId, updatedSubtask: { task_id: parseInt(id, 10), title } }).unwrap();
                setMessage("Subtask updated successfully!");
            } else {
                // Add new subtask
                await addSubtask({ task_id: parseInt(id, 10), title }).unwrap();
                setMessage("Subtask added successfully!");
            }

            // Reset Form
            setTitle("");
            setEditId(null);
        } catch (err) {
            setMessage("Error processing request.");
        }
    };

    // Handle Edit
    const handleEdit = (subtask: { id: number; task_id: number; title: string }) => {
        setEditId(subtask.id);
        setTitle(subtask.title);
    };

    // Handle Delete
    const handleDelete = async (subtask_id: number) => {
        if (!subtask_id) { // Use subtask_id here
            console.error("Subtask ID is missing or invalid");
            return;
        }
        try {
            await deleteSubtask(subtask_id).unwrap();
            setMessage("Subtask deleted successfully!");
        } catch (err) {
            setMessage("Error deleting subtask.");
        }
    };

    // Handle Completion Toggle
    const handleCompletionToggle = async (subtaskId: number, currentStatus: boolean) => {
        try {
            // Toggle the completion status (checked or unchecked)
            await updateSubtask({
                subtask_id: subtaskId,
                updatedSubtask: { completed: !currentStatus }
            }).unwrap();
            setMessage("Subtask status updated successfully!");
        } catch (err) {
            setMessage("Error updating subtask status.");
        }
    };

    return (
        <div>
            <h2>{editId ? "Edit Subtask" : "Add Subtask"}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter Subtask Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <button type="submit" disabled={isAdding || isUpdating}>
                    {isAdding || isUpdating ? "Processing..." : editId ? "Update Subtask" : "Add Subtask"}
                </button>
                {editId && (
                    <button type="button" onClick={() => setEditId(null)}>
                        Cancel Edit
                    </button>
                )}
            </form>
            {message && <p>{message}</p>}

            <h2>Subtask List</h2>
            {isFetching ? (
                <p>Loading subtasks...</p>
            ) : (
                <ul>
                    {filteredSubtasks?.map((subtask: { id: number; task_id: number; title: string, completed: boolean }) => (
                        <li key={subtask.id}>
                            <strong>Task ID:</strong> {subtask.task_id}, <strong>Title:</strong> {subtask.title}
                            <Checkbox
                                checked={subtask.completed}
                                onChange={() => handleCompletionToggle(subtask.id, subtask.completed)}
                            />
                            <button onClick={() => handleEdit(subtask)}>Edit</button>
                            <button onClick={() => handleDelete(subtask.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SubtaskForm;
