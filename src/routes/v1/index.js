import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoutes } from './boardRoute'

const Router = express.Router()

// Test APIs V1 status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are working' })
})

// Board APIs
Router.use('/boards', boardRoutes)

export const APIs_V1 = Router
