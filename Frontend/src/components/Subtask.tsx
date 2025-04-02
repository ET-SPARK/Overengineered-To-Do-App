import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useGetSubtasksQuery,
    useAddSubtaskMutation,
    useUpdateSubtaskMutation,
    useDeleteSubtaskMutation
} from '@/redux/apiSlice.ts';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Edit3, Trash2 } from 'lucide-react';
import { log } from 'console';

const Subtask: React.FC = () => {
    const { id } = useParams();
    const { data: subtasks, isLoading, error, refetch } = useGetSubtasksQuery();
    const [addSubtask] = useAddSubtaskMutation();
    const [updateSubtask] = useUpdateSubtaskMutation();
    const [deleteSubtask] = useDeleteSubtaskMutation();
    const navigate = useNavigate();

    // Local state for managing subtasks
    const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);
    const [subtaskEdits, setSubtaskEdits] = useState<{ [key: number]: { title: string, completed: boolean } }>({});

    // Fetch the specific subtask for the given task id
    const taskSubtasks = subtasks?.filter(subtask => subtask.task_id === Number(id));

    // Re-fetch the subtasks after any add/update/delete operation
    useEffect(() => {
        if (subtasks) {
            refetch();
        }
    }, [subtasks, refetch]);


    const handleUpdateSubtask = async (subtaskId: number) => {
        const updatedSubtask = subtaskEdits[subtaskId];
        if (!updatedSubtask) return;

        await updateSubtask({ subtask_id: subtaskId, updatedSubtask });

        // Update local state immediately
        setSubtaskEdits(prevEdits => ({ ...prevEdits, [subtaskId]: { ...updatedSubtask } }));
        setEditingSubtaskId(null);
    };

    // Handle checkbox change for completion status
    const handleCheckboxChange = async (subtaskId: number) => {

        // Find the subtask in the existing list of subtasks
        const updatedSubtask = taskSubtasks?.find(subtask => subtask.subtask_id === subtaskId);

        if (updatedSubtask) {
            // Toggle the completed field
            const updatedData = { ...updatedSubtask, completed: !updatedSubtask.completed };

            // Make the API call to update the subtask
            await updateSubtask({ subtask_id: subtaskId, updatedSubtask: updatedData });

            // Update local state immediately
            setSubtaskEdits(prevEdits => ({
                ...prevEdits,
                [subtaskId]: { ...updatedData },
            }));
        }
    };


    // Handle adding a new subtask
    const handleAddSubtask = async () => {
        const newSubtask = { title: '', completed: false, task_id: Number(id) };
        await addSubtask(newSubtask);
        refetch(); // Refetch subtasks after adding
    };

    // Handle deleting a subtask
    const handleDeleteSubtask = async (subtaskId: number) => {
        await deleteSubtask(subtaskId);
        refetch(); // Refetch subtasks after deleting
    };

    if (isLoading) return <p>Loading subtasks...</p>;
    if (error) return <p>Error loading subtasks.</p>;

    return (
        <div className="w-full lg:px-[360px] px-4">
            <div className="text-start lg:text-4xl text-xl lg:my-10 my-4">Subtasks for Task {id}</div>

            <div
                className="flex items-start lg:my-10 my-4 w-full border p-2 rounded-md cursor-pointer"
                onClick={handleAddSubtask}
            >
                <span className="text-lg font-medium">+ Add a Subtask</span>
            </div>

            {taskSubtasks?.length === 0 ? (
                <p>No subtasks found for this task.</p>
            ) : (
                <ul className="space-y-4">
                    {taskSubtasks.map(subtask => (
                        <li
                            key={subtask.subtask_id}
                            className="p-4 border rounded-lg shadow flex justify-between items-center"
                        >
                            <div className="flex items-center gap-x-2">

                                <Checkbox
                                    id={`subtask-${subtask.subtask_id}`}
                                    value={subtask.completed}
                                    onCheckedChange={() => handleCheckboxChange(subtask.subtask_id)}
                                />



                                {editingSubtaskId === subtask.subtask_id ? (
                                    <Input
                                        value={subtaskEdits[subtask.subtask_id]?.title || subtask.title}
                                        onChange={(e) =>
                                            setSubtaskEdits({
                                                ...subtaskEdits,
                                                [subtask.subtask_id]: {
                                                    title: e.target.value,
                                                    completed: subtaskEdits[subtask.subtask_id]?.completed ?? subtask.completed
                                                }
                                            })
                                        }
                                    />
                                ) : (
                                    <label
                                        htmlFor={`subtask-${subtask.subtask_id}`}
                                        className={`text-sm font-medium ${subtask.completed ? 'line-through text-gray-500' : ''}`}
                                    >
                                        {subtask.title}
                                    </label>
                                )}
                            </div>

                            {editingSubtaskId === subtask.subtask_id ? (
                                <Button onClick={() => handleUpdateSubtask(subtask.subtask_id)}>Save</Button>
                            ) : (
                                <div className="flex gap-x-2">
                                    <Edit3
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setEditingSubtaskId(subtask.subtask_id);
                                            setSubtaskEdits({
                                                ...subtaskEdits,
                                                [subtask.subtask_id]: { title: subtask.title, completed: subtask.completed }
                                            });
                                        }}
                                    />
                                    <Trash2
                                        className="cursor-pointer"
                                        onClick={() => handleDeleteSubtask(subtask.subtask_id)}
                                    />
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Subtask;