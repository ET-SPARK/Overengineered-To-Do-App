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
import { Plus, Trash2, Edit3, FolderDown, Calendar as CalendarIcon, Terminal } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"


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
    const [taskEdits, setTaskEdits] = useState<{ [key: number]: { title: string, completed: boolean, date?: Date } }>({});

    // State for add task dialog
    const [taskTitle, setTaskTitle] = useState<string>("");
    const [date, setDate] = useState<Date>();
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Clear messages after timeout
    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setErrorMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);

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
            // Include all necessary fields in the update payload
            const taskToUpdate = tasks.find(task => task.task_id === taskId);
            if (!taskToUpdate) return;

            const updatePayload = {
                id: taskId,
                updatedTask: {
                    title: updatedTask.title,
                    completed: updatedTask.completed,
                    date: updatedTask.date || taskToUpdate.date,
                    collection_id: taskToUpdate.collection_id
                }
            };

            await updateTask(updatePayload).unwrap();
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.task_id === taskId ? {
                        ...task,
                        title: updatedTask.title,
                        completed: updatedTask.completed,
                        date: updatedTask.date || task.date
                    } : task
                )
            );
            setEditingTaskId(null);
            setSuccessMessage("Task updated successfully!");
        } catch (error) {
            console.error('Failed to update task:', error);
            setErrorMessage("Failed to update task. Please try again.");
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
                setSuccessMessage("Task status updated!");
            } catch (error) {
                console.error('Failed to update task:', error);
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.task_id === taskId ? { ...task, completed: taskToUpdate.completed } : task
                    )
                );
                setErrorMessage("Failed to update task status.");
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
            setSuccessMessage("Task added successfully!");
        } catch (error) {
            console.error('Failed to add task:', error);
            setErrorMessage("Failed to add task. Please try again.");
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        try {
            await deleteTask(taskId).unwrap();
            setTasks(prevTasks => prevTasks.filter(task => task.task_id !== taskId));
            setSuccessMessage("Task deleted successfully!");
        } catch (error) {
            console.error('Failed to delete task:', error);
            setErrorMessage("Failed to delete task. Please try again.");
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
                {/* Success Alert */}
                {successMessage && (
                    <div className="fixed bottom-4 right-4 text-green-700 p-4 rounded-md shadow-lg w-[300px]">
                        <Alert>
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Success!</AlertTitle>
                            <AlertDescription>{successMessage}</AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* Error Alert */}
                {errorMessage && (
                    <div className="fixed bottom-4 right-4 text-red-700 p-4 rounded-md shadow-lg w-[300px]">
                        <Alert>
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    </div>
                )}


                <div className='text-start lg:text-4xl text-xl lg:my-10 my-4'>{collectionName}</div>

                {/* Add Task Dialog */}
                <div className="">
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
                </div>

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
                                            <li key={task.task_id} className="p-4 border rounded-lg shadow">
                                                <div className="flex justify-between items-center">
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
                                                                            completed: taskEdits[task.task_id]?.completed ?? task.completed,
                                                                            date: taskEdits[task.task_id]?.date ?? task.date
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
                                                            <HoverCard>
                                                                <HoverCardTrigger> <Edit3
                                                                    className="cursor-pointer"
                                                                    onClick={() => {
                                                                        setEditingTaskId(task.task_id);
                                                                        setTaskEdits({
                                                                            ...taskEdits,
                                                                            [task.task_id]: {
                                                                                title: task.title,
                                                                                completed: task.completed,
                                                                                date: task.date
                                                                            }
                                                                        });
                                                                    }}
                                                                /></HoverCardTrigger>
                                                                <HoverCardContent className="w-auto h-[50px] text-center flex items-center">
                                                                    Edit
                                                                </HoverCardContent>
                                                            </HoverCard>

                                                            <HoverCard>
                                                                <HoverCardTrigger>
                                                                    <Trash2
                                                                        className="cursor-pointer"
                                                                        onClick={() => handleDeleteTask(task.task_id)}
                                                                    />
                                                                </HoverCardTrigger>
                                                                <HoverCardContent className="w-auto h-[50px] text-center flex items-center">
                                                                    Delete
                                                                </HoverCardContent>
                                                            </HoverCard>


                                                            <HoverCard>
                                                                <HoverCardTrigger>
                                                                    <FolderDown
                                                                        className="cursor-pointer"
                                                                        onClick={() => handleNavigation(task.task_id)}
                                                                    />
                                                                </HoverCardTrigger>
                                                                <HoverCardContent className="w-auto h-[50px] text-center flex items-center">
                                                                    Subtask
                                                                </HoverCardContent>
                                                            </HoverCard>

                                                        </div>
                                                    )}
                                                </div>
                                                {/* Date display */}
                                                <div className="mt-2 text-sm text-gray-500">
                                                    {task.date && format(new Date(task.date), "MMM dd, yyyy")}
                                                </div>
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