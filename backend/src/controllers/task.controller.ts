import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

const VALID_STATUSES: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
const VALID_PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

export async function getTasks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { status, priority, search, page = '1', limit = '10', sortBy = 'createdAt', order = 'desc' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.TaskWhereInput = { userId };

    if (status && VALID_STATUSES.includes(status as TaskStatus)) {
      where.status = status;
    }
    if (priority && VALID_PRIORITIES.includes(priority as Priority)) {
      where.priority = priority;
    }
    if (search?.trim()) {
      where.OR = [
        { title: { contains: search.trim() } },
        { description: { contains: search.trim() } },
      ];
    }

    const validSortFields = ['createdAt', 'updatedAt', 'dueDate', 'title', 'priority'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({ where, skip, take: limitNum, orderBy: { [sortField]: sortOrder } }),
      prisma.task.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
      },
    });
  } catch (err) {
    console.error('[getTasks]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function getTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const task = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }
    res.json({ success: true, data: { task } });
  } catch (err) {
    console.error('[getTask]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function createTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'PENDING',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.user!.userId,
      },
    });
    res.status(201).json({ success: true, message: 'Task created', data: { task } });
  } catch (err) {
    console.error('[createTask]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function updateTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const { title, description, status, priority, dueDate } = req.body;
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
    });
    res.json({ success: true, message: 'Task updated', data: { task } });
  } catch (err) {
    console.error('[updateTask]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function deleteTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    console.error('[deleteTask]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function toggleTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const nextStatus: TaskStatus =
      existing.status === 'COMPLETED' ? 'PENDING' : existing.status === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED';

    const task = await prisma.task.update({ where: { id: req.params.id }, data: { status: nextStatus } });
    res.json({ success: true, message: 'Task status toggled', data: { task } });
  } catch (err) {
    console.error('[toggleTask]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
