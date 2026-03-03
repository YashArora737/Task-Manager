import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken, getRefreshTokenExpiry } from '../lib/jwt';
import { AuthRequest } from '../middleware/auth.middleware';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, username, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      res.status(409).json({ success: false, message: `This ${field} is already taken` });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, username, passwordHash },
      select: { id: true, email: true, username: true, createdAt: true },
    });

    const payload = { userId: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
    });

    res.status(201).json({ success: true, message: 'Registration successful', data: { user, accessToken, refreshToken } });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const payload = { userId: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
    });

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, message: 'Login successful', data: { user: safeUser, accessToken, refreshToken } });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token required' });
      return;
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    const newAccessToken = signAccessToken({ userId: payload.userId, email: payload.email });
    const newRefreshToken = signRefreshToken({ userId: payload.userId, email: payload.email });

    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { token: refreshToken } }),
      prisma.refreshToken.create({
        data: { token: newRefreshToken, userId: stored.userId, expiresAt: getRefreshTokenExpiry() },
      }),
    ]);

    res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
  } catch (err) {
    console.error('[refresh]', err);
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
}

export async function logout(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('[logout]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, username: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: { user } });
  } catch (err) {
    console.error('[getMe]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
