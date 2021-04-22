/**
 * Module for the resource controller.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import fetch from 'node-fetch'

/**
 * Encapsulates the resource controller.
 */
export class ResourceController {
  /**
   * Sends a request to the resource service.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async request (req, res, next) {
    try {
      const options = this.createOptions(req, next)

      const response = await fetch(`${process.env.RESOURCE_SERVICE_URL}api/v1${req.url}`, options)

      await this.sendResponse(res, next, response)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Create HTTP request options.
   *
   * @param {object} req - Express request object.
   * @param {Function} next - Express next middleware function.
   * @returns {object} An object containing the HTTP request options.
   */
  createOptions (req, next) {
    try {
      const options = {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer ' + req.session.access_token
        }
      }

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        options.body = JSON.stringify(req.body)
      }

      return options
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends the response. If the response can't be converted to JSON an empty body is sent.
   *
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {object} apiResponse - Response from the API.
   * @returns {object} An object containing the HTTP request options.
   */
  async sendResponse (res, next, apiResponse) {
    try {
      res
        .status(apiResponse.status)
      try {
        const body = await apiResponse.json()
        res.send(body)
      } catch (error) {
        res.end()
      }
    } catch (error) {
      next(error)
    }
  }
}
