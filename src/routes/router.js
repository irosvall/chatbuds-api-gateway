/**
 * The routers.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se
 * @version 1.0.0
 */

import express from 'express'
import createError from 'http-errors'
import { router as authRouter } from './auth/auth-router.js'

export const router = express.Router()

router.get('/', (req, res, next) => res.json({ message: 'Welcome to the chatbuds API gateway!' }))

router.use('/auth', authRouter)

// Catch 404.
router.use('*', (req, res, next) => next(createError(404)))
