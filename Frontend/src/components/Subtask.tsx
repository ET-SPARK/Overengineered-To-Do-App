import React, { useState } from "react";
import { useAddSubtaskMutation, useUpdateSubtaskMutation, useDeleteSubtaskMutation } from "@/redux/apiSlice";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Trash2, Edit3 } from "lucide-react";

interface SubtaskProps {
    task_id: number;
    subtask: any; // Subtask type (modify according to your backend response)
}

const Subtask: React.FC<SubtaskProps> = ({ task_id, subtask }) => {
    const [subtaskEdits, setSubtaskEdits] = useState({ title: subtask.title, completed: subtask.completed });
    const [editMode, setEditMode] = useState(false);
    const [updateSubtask] = useUpdateSubtaskMutation();
    const [deleteSubtask] = useDeleteSubtaskMutation();

    // Handle updating the subtask
    const handleUpdateSubtask = async () => {
        await updateSubtask({ subtask_id: subtask.subtask_id, updatedSubtask: subtaskEdits });
        setEditMode(false);
    };

    // Handle delete subtask
    const handleDeleteSubtask = async () => {
        await deleteSubtask(subtask.subtask_id);
    };

    return (
        <div className="p-2 border rounded-md flex justify-between items-center">
            <div className="flex items-center gap-x-2">
                <Checkbox
                    id={`subtask-${subtask.subtask_id}`}
                    checked={subtaskEdits.completed}
                    onCheckedChange={() => setSubtaskEdits({ ...subtaskEdits, completed: !subtaskEdits.completed })}
                />
                {editMode ? (
                    <Input
                        value={subtaskEdits.title}
                        onChange={(e) => setSubtaskEdits({ ...subtaskEdits, title: e.target.value })}
                    />
                ) : (
                    <label
                        htmlFor={`subtask-${subtask.subtask_id}`}
                        className={`text-sm font-medium ${subtaskEdits.completed ? "line-through text-gray-500" : ""}`}
                    >
                        {subtask.title}
                    </label>
                )}
            </div>

            {editMode ? (
                <Button onClick={handleUpdateSubtask}>Save</Button>
            ) : (
                <div className="flex gap-x-2">
                    <Edit3
                        className="cursor-pointer"
                        onClick={() => setEditMode(true)}
                    />
                    <Trash2
                        className="cursor-pointer"
                        onClick={handleDeleteSubtask}
                    />
                </div>
            )}
        </div>
    );
};

export default Subtask;
