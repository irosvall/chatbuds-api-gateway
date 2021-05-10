/**
 * Resource routes.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import { ResourceController } from '../../../controllers/api/resource-controller.js'

export const router = express.Router()

const controller = new ResourceController()

// ------------------------------------------------------------------------------
//  Routes
// ------------------------------------------------------------------------------

// PATCH user/friendrequest/:userID
router.patch('/user/friendrequest/:userID', (req, res, next) => controller.sendFriendRequest(req, res, next))

// PATCH user/acceptfriend/:userID
router.patch('/user/acceptfriend/:userID', (req, res, next) => controller.sendFriendRequest(req, res, next))

router.all('*', (req, res, next) => controller.request(req, res, next))
