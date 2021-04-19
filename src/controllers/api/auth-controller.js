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
   * Checks if the user is anonymous.
   *
   * If the user is logged in a 404 status code is given,
   * and if the user anonymous the next middleware is called.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  checkIfAnonymous (req, res, next) {
    if (req.session.access_token) {
      next(createError(404))
    } else {
      next()
    }
  }

  /**
   * Checks if the user is logged in.
   *
   * If the user is anonymous a 404 status code is given,
   * and if the user is logged in the next middleware is called.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  checkIfLoggedIn (req, res, next) {
    if (!req.session.access_token) {
      next(createError(404))
    } else {
      next()
    }
  }

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
      const responseBody = await response.json()

      if (response.status === 200) {
        // Regenerates session and add the JWT access token to it.
        req.session.regenerate((error) => {
          if (!error) {
            req.session.access_token = responseBody.access_token

            res
              .status(response.status)
              .end()
          } else {
            next(error)
          }
        })
      } else {
        res
          .status(response.status)
          .send(responseBody)
      }
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
      const authResponse = await this.request(req, next, 'api/v1/register')

      let resourceResponse
      // Creates a user in the resource service
      if (authResponse.status === 201) {
        resourceResponse = await this.createUserInResourceService(req, next)

        await this.sendEmptyIfOKResponse(res, resourceResponse)
      } else {
        await this.sendEmptyIfOKResponse(res, authResponse)
      }
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

  /**
   * Sends an empty body response if the API response status is in between 200-299,
   * otherwise send JSON in the body.
   *
   * @param {object} res - Express response object.
   * @param {object} apiResponse - Response from the API.
   */
  async sendEmptyIfOKResponse (res, apiResponse) {
    res
      .status(apiResponse.status)
    if (apiResponse.ok) {
      res.end()
    } else {
      res.send(await apiResponse.json())
    }
  }

  /**
   * Creates the user at the resource service.
   *
   * @param {object} req - Express request object.
   * @param {Function} next - Express next middleware function.
   * @returns {object} - The response from the server.
   */
  async createUserInResourceService (req, next) {
    try {
      const response = await fetch(`${process.env.RESOURCE_SERVICE_URL}api/v1/user`, {
        method: 'POST',
        body: JSON.stringify({
          username: req.body.username,
          email: req.body.email
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      return response
    } catch (error) {
      // TODO: Delete account from auth service.
      next(error)
    }
  }
}
