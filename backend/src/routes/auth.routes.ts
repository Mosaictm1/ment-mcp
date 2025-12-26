import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import type { SignupBody, LoginBody } from '../types/index.js';

// Validation schemas
const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export async function authRoutes(app: FastifyInstance) {
    // ============================================
    // POST /auth/signup
    // ============================================
    app.post('/signup', async (request: FastifyRequest<{ Body: SignupBody }>, reply: FastifyReply) => {
        const validation = signupSchema.safeParse(request.body);
        if (!validation.success) {
            return reply.status(400).send({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input',
                    details: validation.error.format(),
                },
            });
        }

        const { email, password, name } = validation.data;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return reply.status(409).send({
                error: {
                    code: 'USER_EXISTS',
                    message: 'Email already registered',
                },
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                subscriptionTier: true,
                createdAt: true,
            },
        });

        // Generate tokens
        const accessToken = app.jwt.sign({
            id: user.id,
            email: user.email,
            tier: user.subscriptionTier,
        });

        const refreshToken = app.jwt.sign(
            { id: user.id, type: 'refresh' },
            { expiresIn: '7d' }
        );

        return reply.status(201).send({
            user,
            tokens: {
                accessToken,
                refreshToken,
            },
        });
    });

    // ============================================
    // POST /auth/login
    // ============================================
    app.post('/login', async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
        const validation = loginSchema.safeParse(request.body);
        if (!validation.success) {
            return reply.status(400).send({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input',
                    details: validation.error.format(),
                },
            });
        }

        const { email, password } = validation.data;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return reply.status(401).send({
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password',
                },
            });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return reply.status(401).send({
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password',
                },
            });
        }

        // Generate tokens
        const accessToken = app.jwt.sign({
            id: user.id,
            email: user.email,
            tier: user.subscriptionTier,
        });

        const refreshToken = app.jwt.sign(
            { id: user.id, type: 'refresh' },
            { expiresIn: '7d' }
        );

        return reply.send({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                subscriptionTier: user.subscriptionTier,
            },
            tokens: {
                accessToken,
                refreshToken,
            },
        });
    });

    // ============================================
    // POST /auth/refresh-token
    // ============================================
    app.post('/refresh-token', async (request: FastifyRequest<{ Body: { refreshToken: string } }>, reply: FastifyReply) => {
        const { refreshToken } = request.body;

        if (!refreshToken) {
            return reply.status(400).send({
                error: {
                    code: 'MISSING_TOKEN',
                    message: 'Refresh token is required',
                },
            });
        }

        try {
            const decoded = app.jwt.verify<{ id: string; type: string }>(refreshToken);

            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type');
            }

            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
            });

            if (!user) {
                throw new Error('User not found');
            }

            const newAccessToken = app.jwt.sign({
                id: user.id,
                email: user.email,
                tier: user.subscriptionTier,
            });

            const newRefreshToken = app.jwt.sign(
                { id: user.id, type: 'refresh' },
                { expiresIn: '7d' }
            );

            return reply.send({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            });
        } catch {
            return reply.status(401).send({
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired refresh token',
                },
            });
        }
    });
}
