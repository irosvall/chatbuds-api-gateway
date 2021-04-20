/**
 * Authenticaton router.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se
 * @version 1.0.0
 */

import express from 'express'
import { router as authRouter } from './auth-router.js'

export const router = express.Router()

router.use('/auth', authRouter)
