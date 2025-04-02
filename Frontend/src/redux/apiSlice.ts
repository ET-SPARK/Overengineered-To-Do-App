import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000" }),
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: () => "/tasks",
    }),
    getSubtasks: builder.query({
      query: () => "/subtasks",
    }),
    getCollections: builder.query({
      query: () => "/collections",
    }),
    addTask: builder.mutation({
      query: (newTask) => ({
        url: "/tasks",
        method: "POST",
        body: newTask,
      }),
    }),
    updateTask: builder.mutation({
      query: ({ id, updatedTask }) => ({
        url: `/tasks/${id}`,
        method: "PUT",
        body: updatedTask,
      }),
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
    }),
    addSubtask: builder.mutation({
      query: (newSubtask) => ({
        url: "/subtasks",
        method: "POST",
        body: newSubtask,
      }),
    }),
    updateSubtask: builder.mutation({
      query: ({ subtask_id, updatedSubtask }) => ({
        url: `/subtasks/${subtask_id}`,
        method: "PUT",
        body: updatedSubtask,
      }),
    }),
    deleteSubtask: builder.mutation({
      query: (subtask_id) => ({
        url: `/subtasks/${subtask_id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetSubtasksQuery,
  useGetCollectionsQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAddSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
} = apiSlice;
