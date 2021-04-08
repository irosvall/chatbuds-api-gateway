/**
 * Module for the auth controller.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import createError from 'http-errors'
import fetch from 'node-fetch'

/**
 * Encapsulates the auth controller.
 */
export class AuthController {
  /**
   * Creates an account.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async register (req, res, next) {
    try {
      const response = await fetch(`${process.env.AUTH_SERVICE_URL}api/v1/register`, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body)
      })

      if (response.status !== 201) {
        next(createError(response.status))
      } else {
        res
          .status(response.status)
          .json(await response.json())
      }
    } catch (error) {
      next(error)
    }
  }
}
