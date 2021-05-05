/**
 * Module for the random chat service.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

/**
 * Encapsulates the random chat service.
 */
export class RandomChatService {
  /**
   * Creates an instance of the random chat service.
   */
  constructor () {
    this._chatQueue = []
  }

  /**
   * Makes the user join the chat queue.
   *
   * @param {socket} socket - The user's socket connection.
   */
  joinQueue (socket) {
    const isSameUser = this._chatQueue.some(element => element.socket.user.userID === socket.user.userID)

    if (!isSameUser) {
      this._chatQueue.push({
        previousChatBuddy: undefined,
        socket
      })

      this._searchChatBuddy()
    }
  }

  /**
   * Removes the user from the queue if it exist there.
   *
   * @param {socket} socket - The user's socket connection.
   */
  leaveQueue (socket) {
    const userIndex = this._chatQueue.findIndex(user => user.socket.user.userID === socket.user.userID)

    if (userIndex !== -1) {
      this._chatQueue.splice(userIndex, 1)
    }
  }

  /**
   * Search for a chatting match and emits socket event when found.
   */
  _searchChatBuddy () {
    if (this._chatQueue.length > 1) {
      for (let i = 0; i < this._chatQueue.length; i++) {
        let matchIndex = -1

        // If the user has no previous chat buddy it gets paired with the next user if it exists.
        if (this._chatQueue[i].previousChatBuddy === undefined) {
          if (typeof this._chatQueue[i + 1] !== 'undefined') {
            matchIndex = i + 1
          }
        } else {
          matchIndex = this._chatQueue.findIndex(otherUser =>
            this._chatQueue[i].previousChatBuddy !== otherUser.previousChatBuddy &&
            this._chatQueue[i].socket.user.userID !== otherUser.socket.user.userID)
        }

        // If a match is found.
        if (matchIndex !== -1) {
          this._emitChatMatch(this._chatQueue[i], this._chatQueue[matchIndex])

          // Removes users from the queue.
          this._chatQueue.splice(matchIndex, 1)
          this._chatQueue.splice(i, 1)

          // Backs a step to not jump over a user when deleting the current.
          i--
        }
      }
    }
  }

  /**
   * Emit "chatMatch" to the users.
   *
   * @param {object} user1 - The first user.
   * @param {object} user2 - The second user.
   */
  _emitChatMatch (user1, user2) {
    user1.socket.emit('chatMatch', {
      userID: user2.socket.user.userID,
      username: user2.socket.user.username
    })

    user2.socket.emit('chatMatch', {
      userID: user1.socket.user.userID,
      username: user1.socket.user.username
    })
  }
}
