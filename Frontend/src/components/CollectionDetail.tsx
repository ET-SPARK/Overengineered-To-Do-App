import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
    useGetTasksQuery,
    useGetCollectionsQuery,
    useUpdateTaskMutation,
    useDeleteTaskMutation
} from "@/redux/apiSlice.ts";
import NavBar from "./NavBar";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const CollectionDetail: React.FC = () => {
    const { id } = useParams();
    const { data: tasksData, error, isLoading } = useGetTasksQuery();
    const { data: collections } = useGetCollectionsQuery();
    const [updateTask] = useUpdateTaskMutation();
    const [deleteTask] = useDeleteTaskMutation();

    // Local state for tasks to update UI immediately
    const [tasks, setTasks] = useState<any[]>([]);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [taskEdits, setTaskEdits] = useState<{ [key: number]: { title: string, completed: boolean } }>({});

    useEffect(() => {
        if (tasksData) {
            setTasks(tasksData.filter(task => Number(task.collection_id) === Number(id)));
        }
    }, [tasksData, id]);

    if (isLoading) return <p>Loading tasks...</p>;
    if (error) return <p>Error loading tasks.</p>;

    const collection = collections?.find(col => Number(col.collection_id) === Number(id));
    const collectionName = collection ? collection.name : "Unknown Collection";

    // Update a task's title or completion state
    const handleUpdateTask = async (taskId: number) => {
        const updatedTask = taskEdits[taskId];
        if (!updatedTask) return;

        await updateTask({ id: taskId, updatedTask });

        // Update local state immediately
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.task_id === taskId ? { ...task, ...updatedTask } : task
            )
        );

        setEditingTaskId(null);
    };

    // Toggle completed status
    const handleCheckboxChange = async (taskId: number) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.task_id === taskId ? { ...task, completed: !task.completed } : task
            )
        );

        const updatedTask = tasks.find(task => task.task_id === taskId);
        if (updatedTask) {
            await updateTask({ id: taskId, updatedTask: { ...updatedTask, completed: !updatedTask.completed } });
        }
    };

    // Delete a task
    const handleDeleteTask = async (taskId: number) => {
        await deleteTask(taskId);

        // Remove from local state immediately
        setTasks(prevTasks => prevTasks.filter(task => task.task_id !== taskId));
    };

    return (
        <>
            <NavBar />
            <div className="w-full lg:px-[360px] px-4">
                <div className='text-start lg:text-4xl text-xl lg:my-10 my-4'>{collectionName}</div>
                <div className='flex items-start lg:my-10 my-4 w-full border p-2 rounded-md'>
                    <Plus className="w-5 h-5 mr-2" />
                    Add a task
                </div>

                {tasks.length === 0 ? (
                    <p>No tasks found for this collection.</p>
                ) : (
                    <ul className="space-y-4">
                        {["Completed", "Incomplete"].map(status => {
                            const filteredTasks = tasks.filter(task =>
                                status === "Completed" ? task.completed : !task.completed
                            );

                            if (filteredTasks.length === 0) return null;

                            return (
                                <div key={status}>
                                    <div className="text-lg font-bold">{status} Tasks</div>
                                    <ul className="space-y-4">
                                        {filteredTasks.map(task => (
                                            <li key={task.task_id} className="p-4 border rounded-lg shadow flex justify-between items-center">
                                                <div className="flex items-center gap-x-2">
                                                    <Checkbox
                                                        id={`task-${task.task_id}`}
                                                        checked={task.completed}
                                                        onCheckedChange={() => handleCheckboxChange(task.task_id)}
                                                    />
                                                    {editingTaskId === task.task_id ? (
                                                        <Input
                                                            value={taskEdits[task.task_id]?.title || task.title}
                                                            onChange={(e) =>
                                                                setTaskEdits({
                                                                    ...taskEdits,
                                                                    [task.task_id]: {
                                                                        title: e.target.value,
                                                                        completed: taskEdits[task.task_id]?.completed ?? task.completed
                                                                    }
                                                                })
                                                            }
                                                        />
                                                    ) : (
                                                        <label
                                                            htmlFor={`task-${task.task_id}`}
                                                            className={`text-sm font-medium ${task.completed ? "line-through text-gray-500" : ""}`}
                                                        >
                                                            {task.title}
                                                        </label>
                                                    )}
                                                </div>

                                                {editingTaskId === task.task_id ? (
                                                    <Button onClick={() => handleUpdateTask(task.task_id)}>Save</Button>
                                                ) : (
                                                    <div className="flex gap-x-2">
                                                        <Edit3
                                                            className="cursor-pointer"
                                                            onClick={() => {
                                                                setEditingTaskId(task.task_id);
                                                                setTaskEdits({
                                                                    ...taskEdits,
                                                                    [task.task_id]: { title: task.title, completed: task.completed }
                                                                });
                                                            }}
                                                        />
                                                        <Trash2
                                                            className="cursor-pointer"
                                                            onClick={() => handleDeleteTask(task.task_id)}
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
        </>
    );
};

export default CollectionDetail;
