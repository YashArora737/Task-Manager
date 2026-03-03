'use client';
import { Task, TaskStatus, Priority } from '@/types';
import { Pencil, Trash2, CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { format, isPast } from 'date-fns';
import clsx from 'clsx';

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-500/15 text-blue-400 border border-blue-500/20', icon: AlertCircle },
  COMPLETED: { label: 'Completed', color: 'bg-green-500/15 text-green-400 border border-green-500/20', icon: CheckCircle },
};

const priorityConfig: Record<Priority, { label: string; color: string; dot: string }> = {
  LOW: { label: 'Low', color: 'text-slate-400', dot: 'bg-slate-500' },
  MEDIUM: { label: 'Medium', color: 'text-orange-400', dot: 'bg-orange-400' },
  HIGH: { label: 'High', color: 'text-red-400', dot: 'bg-red-500' },
};

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  isToggling?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, onToggle, isToggling }: Props) {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const StatusIcon = status.icon;
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'COMPLETED';

  return (
    <div className={clsx(
      'dash-card rounded-xl p-4 flex flex-col gap-3 hover:border-white/20 transition-all duration-200',
      task.status === 'COMPLETED' && 'opacity-60',
      isOverdue && '!border-red-500/40',
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className={clsx('font-semibold text-white flex-1 leading-snug', task.status === 'COMPLETED' && 'line-through text-slate-500')}>
          {task.title}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition"
            title="Edit task"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 hover:bg-red-500/20 rounded-lg transition"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-slate-400 line-clamp-2">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 border-t border-white/10">
        {/* Status badge */}
        <button
          onClick={() => onToggle(task.id)}
          disabled={isToggling}
          className={clsx('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition hover:opacity-80 disabled:cursor-wait', status.color)}
          title="Click to cycle status"
        >
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </button>

        {/* Priority */}
        <span className={clsx('inline-flex items-center gap-1 text-xs font-medium', priority.color)}>
          <span className={clsx('w-1.5 h-1.5 rounded-full', priority.dot)} />
          {priority.label}
        </span>

        {/* Due date */}
        {task.dueDate && (
          <span className={clsx('inline-flex items-center gap-1 text-xs ml-auto', isOverdue ? 'text-red-400 font-medium' : 'text-slate-500')}>
            <Calendar className="w-3 h-3" />
            {format(new Date(task.dueDate), 'MMM d, yyyy')}
            {isOverdue && ' (overdue)'}
          </span>
        )}
      </div>
    </div>
  );
}
