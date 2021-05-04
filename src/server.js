/**
 * The starting point of the application.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import session from 'express-session'
import mongoose from 'mongoose'
import connectMongo from 'connect-mongo'
import cookie from 'cookie'
import logger from 'morgan'
import http from 'http'
import createError from 'http-errors'
import { router } from './routes/router.js'
import { connectDB } from './config/mongoose.js'
import { Server } from 'socket.io'

/**
 * The main function of the application.
 */
const main = async () => {
  await connectDB()

  const MongoStore = connectMongo(session)

  const app = express()

  // Set various HTTP headers to make the application little more secure (https://www.npmjs.com/package/helmet).
  app.use(helmet())

  // Setup CORS options.
  const corsOptions = {
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true
  }

  if (app.get('env') !== 'production') {
    corsOptions.origin = 'http://localhost:4200'
  }

  // Enable CORS.
  app.use(cors(corsOptions))

  // Set up a morgan logger using the dev format for log entries.
  app.use(logger('dev'))

  // Parse requests of the content type application/json.
  app.use(express.json())

  // Setup the session storage.
  const sessionStore = new MongoStore({
    mongooseConnection: mongoose.connection,
    collection: 'sessions'
  })

  // Setup and use session middleware.
  const sessionOptions = {
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false, // Resave even if a request is not changing the session.
    saveUninitialized: false, // Don't save a created but not modified session.
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: 'lax'
    }
  }

  if (app.get('env') === 'production') {
    console.log('Running in production')
    app.set('trust proxy', 1)
    sessionOptions.cookie.secure = true
  }

  app.use(session(sessionOptions))

  // Socket.io: Add socket.io to the Express project
  const server = http.createServer(app)
  const io = new Server(server, { cors: corsOptions })

  // Socket.io: Add the user's session properties to socket.user.
  io.use((socket, next) => {
    let sessionID = socket.user?.sessionID

    // If socket doesn't have a sessionID then parse the cookie to retrieve it.
    if (!sessionID) {
      sessionID = cookie.parse(socket.handshake.headers.cookie)['chatbuds-session']
        .substring(2)
        .split('.')[0]
    }
    if (sessionID) {
      // Retrieve session from storage
      let session
      sessionStore.get(sessionID, (error, retrievedSession) => {
        if (error) {
          return next(error)
        }
        session = retrievedSession

        // If a session exists add its properties to the socket user property.
        if (session) {
          socket.user = {
            sessionID: sessionID,
            userID: session.userID,
            access_token: session.access_token,
            username: session.username
          }
          return next()
        } else {
          next(createError(401))
        }
      })
    } else {
      next(createError(401))
    }
  })

  // Socket.io; Loggs when users connect/disconnect
  io.on('connection', (socket) => {
    socket.join(socket.user.userID)
    console.log('a user connected')

    io.emit('message', 'Welcome to ChatBuds!')

    // Validation of public messages.
    socket.on('publicMessage', (data) => {
      if (!data.message) {
        socket.emit('validationError', 'The data property contains no message property')
      } else if (typeof data.message !== 'string') {
        socket.emit('validationError', 'message is not a string.')
      } else if (data.message.length < 1) {
        socket.emit('validationError', 'The message must contain at least 1 character.')
      } else if (data.message.length > 500) {
        socket.emit('validationError', 'The message has extended the limit of 500 characters.')
      } else {
        io.emit('publicMessage', { message: data.message, sender: { username: socket.user.username } })
      }
    })

    socket.on('disconnect', () => {
      console.log('user disconnected')
    })

    socket.on('connect_error', (err) => {
      console.log(`connect_error due to ${err.message}`)
    })

    socket.on('error', (err) => {
      console.log(`error due to ${err.message}`)
    })
  })

  // middleware to be executed before the routes.
  app.use((req, res, next) => {
    // Socket.io: Add Socket.io to the Response-object to make it available in controllers.
    res.io = io

    next()
  })

  // Register routes.
  app.use('/', router)

  // Error handler.
  app.use(function (err, req, res, next) {
    err.status = err.status || 500

    if (req.app.get('env') !== 'development') {
      res
        .status(err.status)
        .json({
          status: err.status,
          message: err.message
        })
      return
    }

    // Development only!
    // Only providing detailed error in development.
    return res
      .status(err.status)
      .json({
        status: err.status,
        message: err.message,
        innerException: err.innerException,
        stack: err.stack
      })
  })

  // Starts the HTTP server listening for connections.
  server.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
}

main().catch(console.error)
