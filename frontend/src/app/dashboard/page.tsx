'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, CheckCircle, Clock, AlertCircle, ListChecks } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useToggleTask } from '@/hooks/useTasks';
import { TaskFiltersBar } from '@/components/tasks/TaskFilters';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskModal } from '@/components/tasks/TaskModal';
import { Navbar } from '@/components/Navbar';
import { Task, TaskFilters } from '@/types';

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [filters, setFilters] = useState<TaskFilters>({ page: 1, limit: 9, order: 'desc', sortBy: 'createdAt' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useTasks(filters);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleTask = useToggleTask();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) return (
    <div className="dash-bg min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400" />
    </div>
  );

  if (!isAuthenticated) return null;

  const tasks = data?.tasks || [];
  const pagination = data?.pagination;

  const statCounts = {
    total: pagination?.total || 0,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
  };

  const handleSaveTask = async (formData: Partial<Task>) => {
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, ...formData });
    } else {
      await createTask.mutateAsync(formData);
    }
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleEdit = (task: Task) => { setEditingTask(task); setModalOpen(true); };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    setDeletingId(id);
    await deleteTask.mutateAsync(id).finally(() => setDeletingId(null));
  };

  return (
    <div className="dash-bg min-h-screen">
      {/* Ambient orbs */}
      <div className="dash-orb-1" />
      <div className="dash-orb-2" />
      <div className="dash-orb-3" />

      <div className="relative z-10">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: pagination?.total || 0, icon: ListChecks, color: 'text-primary-400 bg-primary-500/15' },
            { label: 'Pending', value: statCounts.pending, icon: Clock, color: 'text-yellow-400 bg-yellow-500/15' },
            { label: 'In Progress', value: statCounts.inProgress, icon: AlertCircle, color: 'text-blue-400 bg-blue-500/15' },
            { label: 'Completed', value: statCounts.completed, icon: CheckCircle, color: 'text-green-400 bg-green-500/15' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="dash-card rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Header + Add button */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">My Tasks</h1>
          <button
            onClick={() => { setEditingTask(null); setModalOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="dash-card rounded-xl p-4">
          <TaskFiltersBar
            filters={filters}
            onChange={setFilters}
            total={pagination?.total || 0}
          />
        </div>

        {/* Task grid */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 dash-card rounded-xl">
            <ListChecks className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-400">No tasks found</h3>
              <p className="text-sm text-slate-500 mt-1">
              {filters.search || filters.status || filters.priority ? 'Try adjusting your filters' : 'Create your first task to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={(id) => toggleTask.mutate(id)}
                isToggling={toggleTask.isPending && toggleTask.variables === task.id}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-2">
            <button
              disabled={filters.page === 1}
              onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) - 1 }))}
              className="px-3 py-1.5 text-sm dash-card rounded-lg disabled:opacity-30 text-slate-300 hover:border-white/20 hover:text-white transition"
            >
              Previous
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setFilters(f => ({ ...f, page: p }))}
                className={`w-9 h-9 text-sm rounded-lg transition ${p === filters.page ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50' : 'dash-card text-slate-300 hover:text-white hover:border-white/20'}`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={filters.page === pagination.totalPages}
              onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))}
              className="px-3 py-1.5 text-sm dash-card rounded-lg disabled:opacity-30 text-slate-300 hover:border-white/20 hover:text-white transition"
            >
              Next
            </button>
          </div>
        )}
      </main>
      </div>

      <TaskModal
        task={editingTask}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        isSaving={createTask.isPending || updateTask.isPending}
      />
    </div>
  );
}
