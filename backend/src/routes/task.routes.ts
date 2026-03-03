import { Router } from 'express';
import { getTasks, getTask, createTask, updateTask, deleteTask, toggleTask } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTaskValidator, updateTaskValidator } from '../validators/task.validator';

const router = Router();

// All task routes are protected
router.use(authenticate);

// GET /tasks?page=1&limit=10&status=PENDING&priority=HIGH&search=foo&sortBy=createdAt&order=desc
router.get('/', getTasks);

// POST /tasks
router.post('/', createTaskValidator, validate, createTask);

// GET /tasks/:id
router.get('/:id', getTask);

// PATCH /tasks/:id
router.patch('/:id', updateTaskValidator, validate, updateTask);

// DELETE /tasks/:id
router.delete('/:id', deleteTask);

// PATCH /tasks/:id/toggle
router.patch('/:id/toggle', toggleTask);

export default router;
