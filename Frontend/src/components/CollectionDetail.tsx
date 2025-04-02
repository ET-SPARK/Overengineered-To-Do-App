import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    useGetTasksQuery,
    useGetCollectionsQuery,
    useUpdateTaskMutation,
    useDeleteTaskMutation,
    useAddTaskMutation
} from "@/redux/apiSlice.ts";
import NavBar from "./NavBar";
import { Plus, Trash2, Edit3, FolderDown, Calendar as CalendarIcon } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
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
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const CollectionDetail: React.FC = () => {
    const { id } = useParams();
    const { data: tasksData, error, isLoading } = useGetTasksQuery();
    const { data: collections } = useGetCollectionsQuery();
    const [updateTask] = useUpdateTaskMutation();
    const [deleteTask] = useDeleteTaskMutation();
    const [addTask] = useAddTaskMutation();
    const navigate = useNavigate();

    // Local state for tasks
    const [tasks, setTasks] = useState<any[]>([]);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [taskEdits, setTaskEdits] = useState<{ [key: number]: { title: string, completed: boolean } }>({});

    // State for add task dialog
    const [taskTitle, setTaskTitle] = useState<string>("");
    const [date, setDate] = useState<Date>();
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (tasksData) {
            setTasks(tasksData.filter(task => Number(task.collection_id) === Number(id)));
        }
    }, [tasksData, id]);

    if (isLoading) return <p>Loading tasks...</p>;
    if (error) return <p>Error loading tasks.</p>;

    const collection = collections?.find(col => Number(col.collection_id) === Number(id));
    const collectionName = collection ? collection.name : "Unknown Collection";

    const handleUpdateTask = async (taskId: number) => {
        const updatedTask = taskEdits[taskId];
        if (!updatedTask) return;

        try {
            await updateTask({ id: taskId, updatedTask }).unwrap();
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.task_id === taskId ? { ...task, ...updatedTask } : task
                )
            );
            setEditingTaskId(null);
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const handleCheckboxChange = async (taskId: number) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.task_id === taskId ? { ...task, completed: !task.completed } : task
            )
        );

        const taskToUpdate = tasks.find(task => task.task_id === taskId);
        if (taskToUpdate) {
            try {
                await updateTask({
                    id: taskId,
                    updatedTask: { ...taskToUpdate, completed: !taskToUpdate.completed }
                }).unwrap();
            } catch (error) {
                console.error('Failed to update task:', error);
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.task_id === taskId ? { ...task, completed: taskToUpdate.completed } : task
                    )
                );
            }
        }
    };

    const handleAddTask = async () => {
        if (!taskTitle.trim()) {
            setErrorMessage("Title is required");
            return;
        }
        if (!date) {
            setErrorMessage("Date is required");
            return;
        }
        if (!id) {
            setErrorMessage("Collection ID is required");
            return;
        }

        try {
            const newTask = {
                title: taskTitle,
                completed: false,
                collection_id: Number(id),
                date: date
            };

            const result = await addTask(newTask).unwrap();
            setTasks(prevTasks => [...prevTasks, result]);
            setTaskTitle("");
            setDate(undefined);
            setErrorMessage(null);
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Failed to add task:', error);
            setErrorMessage("Failed to add task. Please try again.");
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        try {
            await deleteTask(taskId).unwrap();
            setTasks(prevTasks => prevTasks.filter(task => task.task_id !== taskId));
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const handleNavigation = (taskId: number) => {
        navigate(`/subtask/${taskId}`);
    };

    const isFormValid = taskTitle.trim() !== "" && date !== undefined && id !== undefined;

    return (
        <>
            <NavBar />
            <div className="w-full lg:px-[360px] px-4">
                <div className='text-start lg:text-4xl text-xl lg:my-10 my-4'>{collectionName}</div>

                {/* Add Task Dialog */}
                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <Card className='w-full h-[200px] border-dotted rounded-2xl p-4 flex flex-col justify-center items-center bg-background cursor-pointer lg:my-10 my-4'>
                            <Plus className="w-5 h-5" />
                            <span className="mt-2">Add a Task</span>
                        </Card>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <Input
                                type="text"
                                placeholder="Enter task title"
                                value={taskTitle}
                                onChange={(e) => {
                                    setTaskTitle(e.target.value);
                                    setErrorMessage(null);
                                }}
                                autoFocus
                                className={errorMessage && !taskTitle.trim() ? "border-red-500" : ""}
                            />

                            <div className="mt-4">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !date && "text-muted-foreground",
                                                errorMessage && !date ? "border-red-500" : ""
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={(selectedDate) => {
                                                setDate(selectedDate);
                                                setErrorMessage(null);
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {errorMessage && (
                                <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
                            )}
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => {
                                setErrorMessage(null);
                                setTaskTitle("");
                                setDate(undefined);
                            }}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                disabled={!isFormValid}
                                onClick={handleAddTask}
                            >
                                Add Task
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {tasks.length === 0 ? (
                    <p>No tasks found for this collection.</p>
                ) : (
                    <ul className="space-y-4">
                        {["Incomplete", "Completed"].map(status => {
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
                                                        <FolderDown
                                                            className="cursor-pointer"
                                                            onClick={() => handleNavigation(task.task_id)}
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