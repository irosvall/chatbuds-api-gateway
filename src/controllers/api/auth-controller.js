/**
 * Module for the auth controller.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

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

      res
        .status(response.status)
        .send(await response.json())
    } catch (error) {
      next(error)
    }
  }
}
