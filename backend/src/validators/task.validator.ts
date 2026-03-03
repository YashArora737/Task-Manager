import { body } from 'express-validator';

export const createTaskValidator = [
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be under 255 chars'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
    .withMessage('Status must be PENDING, IN_PROGRESS, or COMPLETED'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Priority must be LOW, MEDIUM, or HIGH'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid ISO date'),
];

export const updateTaskValidator = [
  body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Title must be under 255 chars'),
  body('description').optional({ nullable: true }).isString().withMessage('Description must be a string'),
  body('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
    .withMessage('Status must be PENDING, IN_PROGRESS, or COMPLETED'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Priority must be LOW, MEDIUM, or HIGH'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid ISO date'),
];
