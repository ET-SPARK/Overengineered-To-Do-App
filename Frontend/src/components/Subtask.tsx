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
import { Edit3, Trash2, Plus, Calendar as CalendarIcon, Terminal } from 'lucide-react';
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
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"


const Subtask: React.FC = () => {
    const { id } = useParams();
    const { data: subtasksData, isLoading, error } = useGetSubtasksQuery();
    const [addSubtask] = useAddSubtaskMutation();
    const [updateSubtask] = useUpdateSubtaskMutation();
    const [deleteSubtask] = useDeleteSubtaskMutation();

    // Local state for subtasks
    const [subtasks, setSubtasks] = useState<any[]>([]);
    const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);
    const [subtaskEdits, setSubtaskEdits] = useState<{ [key: number]: { title: string, completed: boolean, date?: Date } }>({});

    // State for add subtask dialog
    const [subtaskTitle, setSubtaskTitle] = useState<string>("");
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
            setSuccessMessage("Subtask updated successfully!");
        } catch (error) {
            console.error('Failed to update subtask:', error);
            setErrorMessage("Failed to update subtask. Please try again.");
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
                setSuccessMessage("Subtask status updated!");
            } catch (error) {
                console.error('Failed to update subtask:', error);
                setSubtasks(prevSubtasks =>
                    prevSubtasks.map(subtask =>
                        subtask.subtask_id === subtaskId ? { ...subtask, completed: subtaskToUpdate.completed } : subtask
                    )
                );
                setErrorMessage("Failed to update subtask status.");
            }
        }
    };

    const handleAddSubtask = async () => {
        if (!subtaskTitle.trim()) {
            setErrorMessage("Title is required");
            return;
        }
        if (!date) {
            setErrorMessage("Date is required");
            return;
        }

        try {
            const newSubtask = {
                title: subtaskTitle,
                completed: false,
                task_id: Number(id),
                date: date
            };

            const result = await addSubtask(newSubtask).unwrap();
            setSubtasks(prevSubtasks => [...prevSubtasks, result]);
            setSubtaskTitle("");
            setDate(undefined);
            setErrorMessage(null);
            setIsDialogOpen(false);
            setSuccessMessage("Subtask added successfully!");
        } catch (error) {
            console.error('Failed to add subtask:', error);
            setErrorMessage("Failed to add subtask. Please try again.");
        }
    };

    const handleDeleteSubtask = async (subtaskId: number) => {
        try {
            await deleteSubtask(subtaskId).unwrap();
            setSubtasks(prevSubtasks => prevSubtasks.filter(subtask => subtask.subtask_id !== subtaskId));
            setSuccessMessage("Subtask deleted successfully!");
        } catch (error) {
            console.error('Failed to delete subtask:', error);
            setErrorMessage("Failed to delete subtask. Please try again.");
        }
    };

    if (isLoading) return <p>Loading subtasks...</p>;
    if (error) return <p>Error loading subtasks.</p>;

    const isFormValid = subtaskTitle.trim() !== "" && date !== undefined;

    return (
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

            <div className="text-start lg:text-4xl text-xl lg:my-10 my-4">Subtasks for Task {id}</div>

            {/* Add Subtask Dialog */}
            <div className="">
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
                                onChange={(e) => {
                                    setSubtaskTitle(e.target.value);
                                    setErrorMessage(null);
                                }}
                                autoFocus
                                className={errorMessage && !subtaskTitle.trim() ? "border-red-500" : ""}
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
                                setSubtaskTitle("");
                                setDate(undefined);
                            }}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                disabled={!isFormValid}
                                onClick={handleAddSubtask}
                            >
                                Add Subtask
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

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
                                            className="p-4 border rounded-lg shadow"
                                        >
                                            <div className="flex justify-between items-center">
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
                                                                        completed: subtaskEdits[subtask.subtask_id]?.completed ?? subtask.completed,
                                                                        date: subtaskEdits[subtask.subtask_id]?.date ?? subtask.date
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
                                                        <HoverCard>
                                                            <HoverCardTrigger>
                                                                <Edit3
                                                                    className="cursor-pointer"
                                                                    onClick={() => {
                                                                        setEditingSubtaskId(subtask.subtask_id);
                                                                        setSubtaskEdits({
                                                                            ...subtaskEdits,
                                                                            [subtask.subtask_id]: {
                                                                                title: subtask.title,
                                                                                completed: subtask.completed,
                                                                                date: subtask.date
                                                                            }
                                                                        });
                                                                    }}
                                                                />
                                                            </HoverCardTrigger>
                                                            <HoverCardContent className="w-auto h-[50px] text-center flex items-center">
                                                                Edit
                                                            </HoverCardContent>
                                                        </HoverCard>

                                                        <HoverCard>
                                                            <HoverCardTrigger>
                                                                <Trash2
                                                                    className="cursor-pointer"
                                                                    onClick={() => handleDeleteSubtask(subtask.subtask_id)}
                                                                />
                                                            </HoverCardTrigger>
                                                            <HoverCardContent className="w-auto h-[50px] text-center flex items-center">
                                                                Delete
                                                            </HoverCardContent>
                                                        </HoverCard>

                                                    </div>
                                                )}
                                            </div>
                                            {/* Date display */}
                                            <div className="mt-2 text-sm text-gray-500">
                                                {subtask.date && format(new Date(subtask.date), "MMM dd, yyyy")}
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
    );
};

export default Subtask;