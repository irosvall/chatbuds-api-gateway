/**
 * API version 1 auth routes.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import { AuthController } from '../../../../controllers/api/auth-controller.js'

export const router = express.Router()

const controller = new AuthController()

// POST register
router.post('/register', (req, res, next) => controller.register(req, res, next))
router.post('/login', (req, res, next) => controller.login(req, res, next))
