/**
 * The routers.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se
 * @version 1.0.0
 */

import express from 'express'
import createError from 'http-errors'

export const router = express.Router()

/**
 * Regenerate a new session cookie as if logged in.
 *
 * @param {*} req ...
 * @param {*} res ...
 * @param {*} next ...
 */
const generateSession = (req, res, next) => {
  if (req.session.loggedIn !== true) {
    req.session.regenerate((error) => {
      if (!error) {
        req.session.loggedIn = true
        next()
      } else {
        next(error)
      }
    })
  } else {
    next()
  }
}

router.get('/', generateSession, (req, res, next) => res.json({ message: `Welcome to the chatbuds API gateway! ${req.sessionID} ${req.session.loggedIn}` })
)

// Catch 404.
router.use('*', (req, res, next) => next(createError(404)))
