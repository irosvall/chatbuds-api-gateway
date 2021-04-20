/**
 * Authentication routes.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import { AuthController } from '../../../controllers/api/auth-controller.js'

export const router = express.Router()

const controller = new AuthController()

// POST register
router.post('/register',
  (req, res, next) => controller.checkIfAnonymous(req, res, next),
  (req, res, next) => controller.register(req, res, next))

// POST login
router.post('/login',
  (req, res, next) => controller.checkIfAnonymous(req, res, next),
  (req, res, next) => controller.login(req, res, next))

// Sends status 200 OK if logged in, otherwise 404.
router.post('/isLoggedIn',
  (req, res, next) => controller.checkIfLoggedIn(req, res, next),
  (req, res) => res.status(200).end())
