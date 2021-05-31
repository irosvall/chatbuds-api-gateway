/**
 * Resource routes.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import createError from 'http-errors'
import { ResourceController } from '../../../controllers/api/resource-controller.js'

export const router = express.Router()

const controller = new ResourceController()

// ------------------------------------------------------------------------------
//  Routes
// ------------------------------------------------------------------------------

// POST user is made not to work since it needs to go through auth service first.
router.post('/user', (req, res, next) => next(createError(404)))

// DELETE user is made not to work since it needs to go through auth service first.
router.delete('/user', (req, res, next) => next(createError(404)))

// PATCH user/friendrequest/:userID
router.patch('/user/friendrequest/:userID', (req, res, next) => controller.sendFriendRequest(req, res, next))

// PATCH user/acceptfriend/:userID
router.patch('/user/acceptfriend/:userID', (req, res, next) => controller.acceptFriendRequest(req, res, next))

// DELETE user/removeFriend/:userID
router.delete('/user/removeFriend/:userID', (req, res, next) => controller.removeFriend(req, res, next))

router.all('*', (req, res, next) => controller.request(req, res, next))
