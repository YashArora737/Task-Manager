'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task } from '@/types';
import { X } from 'lucide-react';
import { format } from 'date-fns';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Task>) => void;
  isSaving?: boolean;
}

export function TaskModal({ task, isOpen, onClose, onSave, isSaving }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'PENDING', priority: 'MEDIUM' },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      });
    } else {
      reset({ title: '', description: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '' });
    }
  }, [task, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data: FormData) => {
    onSave({ ...data, dueDate: data.dueDate || null });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg auth-card rounded-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
            <input
              {...register('title')}
              placeholder="Task title..."
              className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition ${errors.title ? 'border-red-500/60' : 'border-white/10'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Optional description..."
              className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 bg-slate-800/80 border border-white/10 rounded-lg text-sm text-white outline-none focus:ring-2 focus:ring-primary-500/50 transition"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 bg-slate-800/80 border border-white/10 rounded-lg text-sm text-white outline-none focus:ring-2 focus:ring-primary-500/50 transition"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
            <input
              {...register('dueDate')}
              type="date"
              className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition [color-scheme:dark]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-white/10 text-slate-300 rounded-lg text-sm font-medium hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg text-sm font-medium transition"
            >
              {isSaving ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
