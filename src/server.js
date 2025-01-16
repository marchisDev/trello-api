/* eslint-disable no-console */

import express from 'express'
import AsyncExitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
const START_SERVER = () => {
  const app = express()

  app.use('/v1', APIs_V1)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(
      `3. Hello ${env.AUTHOR}, Backend Server is running successfully at http://${env.APP_HOST}:${env.APP_PORT}/`
    )
  })

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
