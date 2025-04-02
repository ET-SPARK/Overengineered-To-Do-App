import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import React, { useState, useEffect } from 'react';

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
import NavBar from "./NavBar";
import { useNavigate } from "react-router-dom";

const categories = [
    { value: "school", label: "School", icon: <BookOpen className='h-10 w-10 border p-2 rounded-xl bg-[#c2528a]' /> },
    { value: "personal", label: "Personal", icon: <UserRound className='h-10 w-10 border p-2 rounded-xl bg-[#3dc9c9]' /> },
    { value: "design", label: "Design", icon: <Brush className='h-10 w-10 border p-2 rounded-xl bg-[#b43dd8]' /> },
    { value: "groceries", label: "Groceries", icon: <ShoppingCart className='h-10 w-10 border p-2 rounded-xl bg-[#daa32f]' /> }
];

const iconMap = Object.fromEntries(categories.map(c => [c.value, { icon: c.icon, color: c.icon.props.className.split("bg-")[1] }]));

const Collections: React.FC = () => {

    const { data: collections, error, isLoading } = useGetCollectionsQuery();
    const { data: tasks } = useGetTasksQuery();
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [date, setDate] = useState<Date>();
    const [taskTitle, setTaskTitle] = useState<string>("");
    const [addTask] = useAddTaskMutation();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setErrorMessage(null);
            }, 2000); // Hide after 1 second

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
        <>
            <div>
                <NavBar />
            </div>
            <div className='w-full lg:px-[360px] px-4'>
                <div className='text-start lg:text-4xl text-xl lg:my-10 my-4'>Collections</div>
                <div className='flex flex-col items-start mt-10 w-full'>
                    <Tabs defaultValue="collections" className="w-full">
                        <TabsList className='lg:my-10 my-4 w-[300px] flex justify-start'>
                            <TabsTrigger value="favorites">Favorites</TabsTrigger>
                            <TabsTrigger value="collections">All collections</TabsTrigger>
                        </TabsList>

                        <TabsContent value="favorites" className="w-full">
                            <div className="w-full">fav card</div>
                        </TabsContent>

                        <TabsContent value="collections" className="w-full">
                            <div className='grid lg:grid-cols-3 grid-cols-2 gap-4 w-full'>
                                {collections?.map((collection) => {
                                    const collectionTasks = tasks?.filter(task => task.collection_id === collection.collection_id);
                                    const completedTasks = collectionTasks?.filter(task => task.completed).length || 0;
                                    const totalTasks = collectionTasks?.length || 0;
                                    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                                    const iconData = iconMap[collection.name.toLowerCase()] || { icon: <BookOpen className='h-10 w-10 border p-2 rounded-xl bg-gray-400' />, color: "#808080" };

                                    return (
                                        <Card key={collection.collection_id} className='w-full h-[200px] rounded-2xl p-4 flex flex-col justify-between' onClick={() => navigate(`/collection/${collection.collection_id}`)}>
                                            <CardHeader>
                                                <CardTitle>{iconData.icon}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className='font-bold'>{collection.name}</p>
                                            </CardContent>
                                            <CardFooter className='flex items-center justify-between'>
                                                <CardDescription>{completedTasks}/{totalTasks} done</CardDescription>
                                                <div className='w-10 h-10'>
                                                    <CircularProgressbar
                                                        value={progress}
                                                        text={`${Math.round(progress)}%`}
                                                        styles={buildStyles({
                                                            textSize: "30px",
                                                            pathColor: `#${iconData.color}`,
                                                            textColor: "#333",
                                                            trailColor: "#e0e0e0",
                                                        })}
                                                    />
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    );
                                })}

                                {/* Add new collection button */}
                                <div className="">
                                    {/* Success Alert */}
                                    {successMessage && (
                                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2  text-green-700 p-4 rounded-md shadow-lg w-[300px]">
                                            <Alert>
                                                <Terminal className="h-4 w-4" />
                                                <AlertTitle>Success!</AlertTitle>
                                                <AlertDescription>{successMessage}</AlertDescription>
                                            </Alert>
                                        </div>
                                    )}

                                    {/* Error Alert */}
                                    {errorMessage && (
                                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2  text-red-700 p-4 rounded-md shadow-lg w-[300px]">
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
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
};

export default Collections;