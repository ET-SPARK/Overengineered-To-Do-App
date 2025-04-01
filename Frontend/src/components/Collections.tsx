import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { BookOpen, UserRound, Brush, ShoppingCart, Plus } from 'lucide-react';
import { useGetCollectionsQuery, useGetTasksQuery } from "@/redux/apiSlice.ts";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const iconMap: { [key: string]: { icon: JSX.Element; color: string } } = {
    school: { icon: <BookOpen className='h-10 w-10 border p-2 rounded-xl flex items-center bg-[#c2528a]' />, color: "#c2528a" },
    personal: { icon: <UserRound className='h-10 w-10 border p-2 rounded-xl flex items-center bg-[#3dc9c9]' />, color: "#3dc9c9" },
    design: { icon: <Brush className='h-10 w-10 border p-2 rounded-xl flex items-center bg-[#b43dd8]' />, color: "#b43dd8" },
    groceries: { icon: <ShoppingCart className='h-10 w-10 border p-2 rounded-xl flex items-center bg-[#daa32f]' />, color: "#daa32f" },
};

const Collections: React.FC = () => {
    const { data: collections, error, isLoading } = useGetCollectionsQuery();
    const { data: tasks } = useGetTasksQuery();

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading collections</p>;

    return (
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
                                const iconData = iconMap[collection.name.toLowerCase()] || { icon: <BookOpen className='h-10 w-10 border p-2 rounded-xl flex items-center bg-gray-400' />, color: "#808080" };

                                return (
                                    <Card key={collection.collection_id} className='w-full h-[200px] rounded-2xl p-4 flex flex-col justify-between'>
                                        <CardHeader>
                                            <CardTitle>{iconData.icon}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className='font-bold'>{collection.name}</p>
                                        </CardContent>
                                        <CardFooter className='flex items-center justify-between'>

                                            <CardDescription>
                                                {completedTasks}/{totalTasks} {" "} done
                                            </CardDescription>
                                            <div className='w-10 h-10'>
                                                <CircularProgressbar
                                                    value={progress}
                                                    text={`${Math.round(progress)}%`}
                                                    styles={buildStyles({
                                                        textSize: "30px",
                                                        pathColor: iconData.color,
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
                            <Card className='w-full h-[100px] border-dotted rounded-2xl flex justify-center items-center bg-background'>
                                <Plus className="w-5 h-5" />
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Collections;
