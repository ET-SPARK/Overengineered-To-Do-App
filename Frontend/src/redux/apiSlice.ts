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
  }),
});

export const { useGetTasksQuery, useGetSubtasksQuery, useGetCollectionsQuery } =
  apiSlice;
