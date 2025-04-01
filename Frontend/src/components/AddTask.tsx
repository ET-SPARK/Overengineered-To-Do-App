import React, { useState, useEffect } from 'react';
import {
    Card
} from "@/components/ui/card";
import { BookOpen, UserRound, Brush, ShoppingCart, Plus, Terminal } from 'lucide-react';
import { useGetCollectionsQuery, useGetTasksQuery, useAddTaskMutation } from "@/redux/apiSlice.ts";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AddTask = () => {
    const { data: collections, error, isLoading } = useGetCollectionsQuery();
    const { data: tasks } = useGetTasksQuery();
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [date, setDate] = useState<Date>();
    const [taskTitle, setTaskTitle] = useState<string>("");
    const [addTask] = useAddTaskMutation();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setErrorMessage(null);
            }, 1000); // Hide after 1 second

            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);

    const isFormValid = taskTitle.trim() !== "" && selectedCategory !== null && date !== undefined;

    const handleAddTask = async () => {
        if (isFormValid) {
            try {
                if (!selectedCategory) {
                    setErrorMessage("Error: No category selected");
                    return;
                }

                const newTask = {
                    title: taskTitle,
                    collection_id: selectedCategory,
                    date: date,
                    completed: false,
                };

                await addTask(newTask).unwrap();
                setSuccessMessage("Task added successfully!");

                // Reset form
                setTaskTitle("");
                setSelectedCategory(null);
                setDate(undefined);
            } catch (error) {
                setErrorMessage("Error adding task. Please try again.");
            }
        }
    };

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading collections</p>;

    return (
        <div className="relative">
            {/* Success Alert */}
            {successMessage && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-700 p-4 rounded-md shadow-lg">
                    <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Success!</AlertTitle>
                        <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Error Alert */}
            {errorMessage && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 p-4 rounded-md shadow-lg">
                    <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                </div>
            )}

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Card className='w-full h-[200px] border-dotted rounded-2xl p-4 flex flex-col justify-center items-center bg-background'>
                        <Plus className="w-5 h-5" />
                    </Card>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Input
                            type="text"
                            placeholder="Enter task title"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                        />
                        <div className='grid grid-cols-1 gap-y-2'>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full mt-2">
                                        {selectedCategory
                                            ? collections?.find(col => col.collection_id === selectedCategory)?.name
                                            : "Select Category"}
                                        <ChevronsUpDown className="opacity-50 ml-auto" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-2">
                                    {collections?.map((collection) => (
                                        <div
                                            key={collection.collection_id}
                                            className={`flex items-center p-2 rounded-md cursor-pointer ${selectedCategory === collection.collection_id ? "bg-background" : ""}`}
                                            onClick={() => setSelectedCategory(collection.collection_id)}
                                        >
                                            <span className="ml-2">{collection.name}</span>
                                            {selectedCategory === collection.collection_id && <Check className="ml-auto text-green-500" />}
                                        </div>
                                    ))}
                                </PopoverContent>
                            </Popover>

                            <div className='flex flex-row items-center justify-between'>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[280px] justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
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
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                <div> <Flag className='w-5 h-5 ' /></div>
                            </div>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            disabled={!isFormValid}
                            onClick={handleAddTask}
                        >
                            Add Task
                        </AlertDialogAction>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AddTask;
