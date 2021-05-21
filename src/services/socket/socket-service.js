/**
 * Module for the main socket service.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import { RandomChatService } from './random-chat-service.js'

/**
 * Encapsulates the socket service.
 */
export class SocketService {
  /**
   * Creates an instance of the socket service.
   *
   * @param {io} io - Socket.io input/output for sending messages.
   */
  constructor (io) {
    this._io = io
    this._randomChatService = new RandomChatService()
  }

  /**
   * Set up the user connection and the event listeners.
   *
   * @param {socket} socket - The user's socket connection.
   */
  setup (socket) {
    // Make user join a room of it's own ID.
    socket.join(socket.user.userID)

    console.log('a user connected')

    socket.on('randomChatJoin', ({ options }) => {
      if (options?.previousChatBuddy === undefined || typeof options.previousChatBuddy === 'string') {
        this._randomChatService.joinQueue(socket, options?.previousChatBuddy)
      }
    })

    socket.on('randomChatLeave', ({ to }) => {
      this._randomChatService.leaveQueue(socket)

      if (typeof to === 'string') {
        this._io.to(to).emit('randomChatLeave')
      }
    })

    socket.on('privateMessage', ({ data, to }) => {
      if (this._isValidateMessage(data.message, socket)) {
        if (typeof to === 'string') {
          this._io.to(to).to(socket.user.userID).emit('privateMessage', {
            message: data.message,
            sender: {
              username: socket.user.username,
              userID: socket.user.userID
            },
            to: to
          })
        }
      }
    })

    socket.on('randomMessage', ({ data, to }) => {
      if (this._isValidateMessage(data.message, socket)) {
        if (typeof to === 'string') {
          this._io.to(to).to(socket.user.userID).emit('randomMessage', {
            message: data.message,
            sender: {
              username: socket.user.username,
              userID: socket.user.userID
            }
          })
        }
      }
    })

    socket.on('publicMessage', (data) => {
      if (this._isValidateMessage(data.message, socket)) {
        this._io.emit('publicMessage', {
          message: data.message,
          sender: {
            username: socket.user.username,
            userID: socket.user.userID
          }
        })
      }
    })

    socket.on('disconnect', () => {
      console.log('user disconnected')
    })

    socket.on('connect_error', (err) => {
      console.log(`Socket connect_error due to ${err.message}`)
    })

    socket.on('error', (err) => {
      console.log(`Socket error due to ${err.message}`)
    })
  }

  /**
   * Returns true if the message is valid.
   *
   * @param {string} message - The message.
   * @param {socket} socket - The user's socket connection.
   * @returns {boolean} Returns true if valid.
   */
  _isValidateMessage (message, socket) {
    if (typeof message !== 'string') {
      socket.emit('validationError', 'message is not a string.')
      return false
    } else if (message.length < 1) {
      socket.emit('validationError', 'The message must contain at least 1 character.')
      return false
    } else if (message.length > 500) {
      socket.emit('validationError', 'The message has extended the limit of 500 characters.')
      return false
    }
    return true
  }
}
