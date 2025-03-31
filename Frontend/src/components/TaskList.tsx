import React from "react";
import { useGetTasksQuery, useGetSubtasksQuery, useGetCollectionsQuery } from "@/redux/apiSlice.ts";

const TaskList: React.FC = () => {
    const { data: tasks, error: tasksError, isLoading: tasksLoading } = useGetTasksQuery();
    const { data: subtasks, error: subtasksError, isLoading: subtasksLoading } = useGetSubtasksQuery();
    const { data: collections, error: collectionsError, isLoading: collectionsLoading } = useGetCollectionsQuery();

    if (tasksLoading || subtasksLoading || collectionsLoading) return <p>Loading...</p>;
    if (tasksError || subtasksError || collectionsError) return <p>Error fetching data</p>;

    return (
        <div>
            <h2>📂 Collections:</h2>
            <ul>
                {collections?.map((collection) => (
                    <li key={collection.collection_id}>
                        <strong>📁 {collection.name}</strong>
                        <ul style={{ marginLeft: "20px", listStyleType: "square" }}>
                            {tasks
                                ?.filter((task) => task.collection_id === collection.collection_id)
                                .map((task) => (
                                    <li key={task.task_id} style={{ marginBottom: "10px" }}>
                                        <strong>📝 {task.title}</strong> - {task.completed ? "✅ Completed" : "❌ Pending"}
                                        <ul style={{ marginLeft: "20px", listStyleType: "circle" }}>
                                            {subtasks
                                                ?.filter((sub) => sub.task_id === task.task_id)
                                                .map((subtask) => (
                                                    <li key={subtask.subtask_id}>
                                                        {subtask.title} - {subtask.completed ? "✅" : "❌"}
                                                        <small style={{ color: "gray" }}>
                                                            {" "}
                                                            ({new Date(subtask.date).toLocaleDateString()})
                                                        </small>
                                                    </li>
                                                ))}
                                        </ul>
                                    </li>
                                ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskList;
