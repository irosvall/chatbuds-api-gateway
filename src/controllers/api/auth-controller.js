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
   * Authenticates an account and saves it's JWT to the session.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async login (req, res, next) {
    try {
      const response = await this.request(req, next, 'api/v1/login')

      res
        .status(response.status)
        .send(await response.json())
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates an account.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async register (req, res, next) {
    try {
      const response = await this.request(req, next, 'api/v1/register')

      res
        .status(response.status)
        .send(await response.json())
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a request to the authentication server.
   *
   * @param {object} req - Express request object.
   * @param {Function} next - Express next middleware function.
   * @param {string} path - The path for the request.
   * @returns {object} - The response from the server.
   */
  async request (req, next, path) {
    try {
      const response = await fetch(`${process.env.AUTH_SERVICE_URL}${path}`, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body)
      })

      return response
    } catch (error) {
      next(error)
    }
  }
}
