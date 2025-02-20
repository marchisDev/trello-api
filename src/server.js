/* eslint-disable no-console */

import express from 'express'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import AsyncExitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import cookieParser from 'cookie-parser'
import { inviteUserToBoardSocket } from '~/sockets/inviteUserToBoardSocket'

// Xu li socket.io realtime
//https://socket.io/get-started/chat/#integrating-socketio
import socketIo from 'socket.io'
import http from 'http'

const START_SERVER = () => {
  const app = express()

  // Fix vu Cache from disk cua ExpressJS
  // https://stackoverflow.com/questions/22632593/how-to-disable-webpage-caching-in-expressjs-nodejs/53240717#53240717
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  // Cau hinh cookie parser
  app.use(cookieParser())

  // xu li CORS
  app.use(cors(corsOptions))

  // enable parsing of http request body json data
  app.use(express.json())

  // Use APIs_V1 for all routes starting with /v1
  app.use('/v1', APIs_V1)

  // Middleware to handle errors
  app.use(errorHandlingMiddleware)

  // Tao 1 cai server moi boc app cua express de lam realtime socket.io
  const server = http.createServer(app)
  // khoi tao bien io voi server va cors
  const io = socketIo(server, { cors: corsOptions })
  io.on('connection', (socket) => {
    // goi cac socket tuy theo tinh nang
    inviteUserToBoardSocket(socket)

    // .....
  })

  if (env.BUILD_MODE === 'production') {
    // dung server.listen thay vi app.listen de co the dung socket.io vi luc nay server da bao gom config socket.io va express app
    server.listen(process.env.PORT, () => {
      console.log(
        `3. Production Hello ${env.AUTHOR}, Backend Server is running successfully at Port: ${process.env.PORT}`
      )
    })
  } else {
    // dung server.listen thay vi app.listen de co the dung socket.io vi luc nay server da bao gom config socket.io va express app
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(
        `3.Local Dev Hello ${env.AUTHOR}, Backend Server is running successfully at http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}/`
      )
    })
  }

  AsyncExitHook(() => {
    console.log('4. Closing MongoDB connection...')
    CLOSE_DB()
    console.log('5. MongoDB connection closed successfully!')
  })
}

// chi khi ket noi thanh cong toi MongoDB thi moi chay server
// Immediately Invoked Function Expression (IIFE) / Anonymous Async Function
;(async () => {
  try {
    console.log('1. Connecting to MongoDB...')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB successfully!')

    // Start the Backend Server
    START_SERVER()
  } catch (error) {
    console.error('Error connecting to MongoDB: ', error)
    process.exit(0)
  }
})()

// console.log('1. Connecting to MongoDB...')
// CONNECT_DB()
//   .then(() => console.log('2. Connected to MongoDB successfully!'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.error('Error connecting to MongoDB: ', error)
//     process.exit(0)
//   })
