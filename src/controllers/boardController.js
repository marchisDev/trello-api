import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'
// import ApiError from '~/utils/ApiError'

// eslint-disable-next-line no-unused-vars
const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    // eslint-disable-next-line no-console
    // console.log('req.body:', req.body)
    // dieu huong du lieu sang tang service
    const createdBoard = await boardService.createNew(userId, req.body)
    //   co ket qua thi tra ve client
    // throw new ApiError(StatusCodes.BAD_REQUEST, 'marchisDev test error')
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    // eslint-disable-next-line no-console
    // console.log('req.params:', req.params)
    const userId = req.jwtDecoded._id
    const boardId = req.params.id

    const board = await boardService.getDetails(userId, boardId)
    //   co ket qua thi tra ve client
    // throw new ApiError(StatusCodes.BAD_REQUEST, 'marchisDev test error')
    res.status(StatusCodes.OK).json(board)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id

    const updatedBoard = await boardService.update(boardId, req.body)
    //   co ket qua thi tra ve client
    // throw new ApiError(StatusCodes.BAD_REQUEST, 'marchisDev test error')
    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) { next(error) }
}

const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    // page va itemsPerPage duoc truyen vao teong query url tu phia FE len BE se lay thong tin qua req.query
    const { page, itemsPerPage, q } = req.query
    const queryFilters = q
    // console.log('queryFilters:', queryFilters)
    const results = await boardService.getBoards(userId, page, itemsPerPage, queryFilters)
    res.status(StatusCodes.OK).json(results)
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
}
