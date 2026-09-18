import { Router } from 'express'
import { getCurrentUser, loginUser, logoutUser, refreshSession, registerUser } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { createRateLimiter } from '../middleware/security.js'

export const authRouter = Router()

const authRateLimiter = createRateLimiter({ windowMs: 15 * 60_000, max: 10 })

authRouter.post('/register', authRateLimiter, registerUser)
authRouter.post('/login', authRateLimiter, loginUser)
authRouter.post('/refresh', authRateLimiter, refreshSession)
authRouter.post('/logout', logoutUser)
authRouter.get('/me', authenticate, getCurrentUser)
