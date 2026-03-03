import { Router } from 'express';
import { register, login, refresh, logout, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerValidator, loginValidator } from '../validators/auth.validator';

const router = Router();

// POST /auth/register
router.post('/register', registerValidator, validate, register);

// POST /auth/login
router.post('/login', loginValidator, validate, login);

// POST /auth/refresh
router.post('/refresh', refresh);

// POST /auth/logout
router.post('/logout', logout);

// GET /auth/me
router.get('/me', authenticate, getMe);

export default router;
