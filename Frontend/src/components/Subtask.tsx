import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

const Subtask: React.FC = () => {
    const { id } = useParams();
    const { data: subtasksData, isLoading, error } = useGetSubtasksQuery();
    const [addSubtask] = useAddSubtaskMutation();
    const [updateSubtask] = useUpdateSubtaskMutation();
    const [deleteSubtask] = useDeleteSubtaskMutation();

    // Local state for subtasks to update UI immediately
    const [subtasks, setSubtasks] = useState<any[]>([]);
    const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);
    const [subtaskEdits, setSubtaskEdits] = useState<{ [key: number]: { title: string, completed: boolean } }>({});

    // Filter subtasks for the current task and update local state
    useEffect(() => {
        if (subtasksData) {
            setSubtasks(subtasksData.filter(subtask => Number(subtask.task_id) === Number(id)));
        }
    }, [subtasksData, id]);

    if (isLoading) return <p>Loading subtasks...</p>;
    if (error) return <p>Error loading subtasks.</p>;

    const handleUpdateSubtask = async (subtaskId: number) => {
        const updatedSubtask = subtaskEdits[subtaskId];
        if (!updatedSubtask) return;

        try {
            await updateSubtask({
                subtask_id: subtaskId,
                updatedSubtask
            }).unwrap();

            // Update local state
            setSubtasks(prevSubtasks =>
                prevSubtasks.map(subtask =>
                    subtask.subtask_id === subtaskId ? { ...subtask, ...updatedSubtask } : subtask
                )
            );
            setEditingSubtaskId(null);
        } catch (error) {
            console.error('Failed to update subtask:', error);
        }
    };

    const handleCheckboxChange = async (subtaskId: number) => {
        // Update local state immediately for better UX
        setSubtasks(prevSubtasks =>
            prevSubtasks.map(subtask =>
                subtask.subtask_id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
            )
        );

        // Find the subtask and make API call
        const subtaskToUpdate = subtasks.find(subtask => subtask.subtask_id === subtaskId);
        if (subtaskToUpdate) {
            try {
                await updateSubtask({
                    subtask_id: subtaskId,
                    updatedSubtask: { ...subtaskToUpdate, completed: !subtaskToUpdate.completed }
                }).unwrap();
            } catch (error) {
                console.error('Failed to update subtask:', error);
                // Revert local state if API call fails
                setSubtasks(prevSubtasks =>
                    prevSubtasks.map(subtask =>
                        subtask.subtask_id === subtaskId ? { ...subtask, completed: subtaskToUpdate.completed } : subtask
                    )
                );
            }
        }
    };

    const handleAddSubtask = async () => {
        const newSubtask = {
            title: 'New Subtask',
            completed: false,
            task_id: Number(id)
        };

        try {
            const result = await addSubtask(newSubtask).unwrap();
            // Add the new subtask to local state
            setSubtasks(prevSubtasks => [...prevSubtasks, result]);
        } catch (error) {
            console.error('Failed to add subtask:', error);
        }
    };

    const handleDeleteSubtask = async (subtaskId: number) => {
        try {
            await deleteSubtask(subtaskId).unwrap();
            // Remove from local state
            setSubtasks(prevSubtasks => prevSubtasks.filter(subtask => subtask.subtask_id !== subtaskId));
        } catch (error) {
            console.error('Failed to delete subtask:', error);
        }
    };

    return (
        <div className="w-full lg:px-[360px] px-4">
            <div className="text-start lg:text-4xl text-xl lg:my-10 my-4">Subtasks for Task {id}</div>

            <div
                className="flex items-start lg:my-10 my-4 w-full border p-2 rounded-md cursor-pointer"
                onClick={handleAddSubtask}
            >
                <span className="text-lg font-medium">+ Add a Subtask</span>
            </div>

            {subtasks.length === 0 ? (
                <p>No subtasks found for this task.</p>
            ) : (
                <ul className="space-y-4">
                    {["Incomplete", "Completed"].map(status => {
                        const filteredSubtasks = subtasks.filter(subtask =>
                            status === "Completed" ? subtask.completed : !subtask.completed
                        );

                        if (filteredSubtasks.length === 0) return null;

                        return (
                            <div key={status}>
                                <div className="text-lg font-bold">{status} Subtasks</div>
                                <ul className="space-y-4">
                                    {filteredSubtasks.map(subtask => (
                                        <li
                                            key={subtask.subtask_id}
                                            className="p-4 border rounded-lg shadow flex justify-between items-center"
                                        >
                                            <div className="flex items-center gap-x-2">
                                                <Checkbox
                                                    id={`subtask-${subtask.subtask_id}`}
                                                    checked={subtask.completed}
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
                                                        autoFocus
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
                                                                [subtask.subtask_id]: {
                                                                    title: subtask.title,
                                                                    completed: subtask.completed
                                                                }
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
                            </div>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default Subtask;