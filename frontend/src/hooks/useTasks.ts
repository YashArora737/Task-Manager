'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Task, TaskFilters, TasksResponse } from '@/types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

function getErrorMessage(err: unknown): string {
  const axiosErr = err as AxiosError<{ message?: string }>;
  return axiosErr.response?.data?.message || 'Something went wrong';
}

export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.search) params.set('search', filters.search);
      params.set('page', String(filters.page || 1));
      params.set('limit', String(filters.limit || 10));
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.order) params.set('order', filters.order);
      const { data } = await api.get<{ success: boolean; data: TasksResponse }>(`/tasks?${params}`);
      return data.data;
    },
    staleTime: 30_000,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: { task: Task } }>(`/tasks/${id}`);
      return data.data.task;
    },
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Task>) => {
      const { data } = await api.post<{ success: boolean; data: { task: Task } }>('/tasks', payload);
      return data.data.task;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Task> & { id: string }) => {
      const { data } = await api.patch<{ success: boolean; data: { task: Task } }>(`/tasks/${id}`, payload);
      return data.data.task;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<{ success: boolean; data: { task: Task } }>(`/tasks/${id}/toggle`);
      return data.data.task;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task status updated!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
