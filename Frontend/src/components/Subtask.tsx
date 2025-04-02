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
import { Edit3, Trash2, Plus } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";

const Subtask: React.FC = () => {
    const { id } = useParams();
    const { data: subtasksData, isLoading, error } = useGetSubtasksQuery();
    const [addSubtask] = useAddSubtaskMutation();
    const [updateSubtask] = useUpdateSubtaskMutation();
    const [deleteSubtask] = useDeleteSubtaskMutation();

    // Local state for subtasks
    const [subtasks, setSubtasks] = useState<any[]>([]);
    const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);
    const [subtaskEdits, setSubtaskEdits] = useState<{ [key: number]: { title: string, completed: boolean } }>({});

    // State for add subtask dialog
    const [subtaskTitle, setSubtaskTitle] = useState<string>("");
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    // Filter subtasks for the current task
    useEffect(() => {
        if (subtasksData) {
            setSubtasks(subtasksData.filter(subtask => Number(subtask.task_id) === Number(id)));
        }
    }, [subtasksData, id]);

    const handleUpdateSubtask = async (subtaskId: number) => {
        const updatedSubtask = subtaskEdits[subtaskId];
        if (!updatedSubtask) return;

        try {
            await updateSubtask({
                subtask_id: subtaskId,
                updatedSubtask
            }).unwrap();

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
        setSubtasks(prevSubtasks =>
            prevSubtasks.map(subtask =>
                subtask.subtask_id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
            )
        );

        const subtaskToUpdate = subtasks.find(subtask => subtask.subtask_id === subtaskId);
        if (subtaskToUpdate) {
            try {
                await updateSubtask({
                    subtask_id: subtaskId,
                    updatedSubtask: { ...subtaskToUpdate, completed: !subtaskToUpdate.completed }
                }).unwrap();
            } catch (error) {
                console.error('Failed to update subtask:', error);
                setSubtasks(prevSubtasks =>
                    prevSubtasks.map(subtask =>
                        subtask.subtask_id === subtaskId ? { ...subtask, completed: subtaskToUpdate.completed } : subtask
                    )
                );
            }
        }
    };

    const handleAddSubtask = async () => {
        if (!subtaskTitle.trim()) return;

        try {
            const newSubtask = {
                title: subtaskTitle,
                completed: false,
                task_id: Number(id)
            };

            const result = await addSubtask(newSubtask).unwrap();
            setSubtasks(prevSubtasks => [...prevSubtasks, result]);
            setSubtaskTitle("");
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Failed to add subtask:', error);
        }
    };

    const handleDeleteSubtask = async (subtaskId: number) => {
        try {
            await deleteSubtask(subtaskId).unwrap();
            setSubtasks(prevSubtasks => prevSubtasks.filter(subtask => subtask.subtask_id !== subtaskId));
        } catch (error) {
            console.error('Failed to delete subtask:', error);
        }
    };

    if (isLoading) return <p>Loading subtasks...</p>;
    if (error) return <p>Error loading subtasks.</p>;

    return (
        <div className="w-full lg:px-[360px] px-4">
            <div className="text-start lg:text-4xl text-xl lg:my-10 my-4">Subtasks for Task {id}</div>

            {/* Add Subtask Dialog */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Card className='w-full h-[200px] border-dotted rounded-2xl p-4 flex flex-col justify-center items-center bg-background cursor-pointer'>
                        <Plus className="w-5 h-5" />
                        <span className="mt-2">Add a Subtask</span>
                    </Card>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Input
                            type="text"
                            placeholder="Enter subtask title"
                            value={subtaskTitle}
                            onChange={(e) => setSubtaskTitle(e.target.value)}
                            autoFocus
                        />
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={!subtaskTitle.trim()}
                            onClick={handleAddSubtask}
                        >
                            Add Subtask
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {subtasks.length === 0 ? (
                <p className="mt-4">No subtasks found for this task.</p>
            ) : (
                <ul className="space-y-4 mt-4">
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