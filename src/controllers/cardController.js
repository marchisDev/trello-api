import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'
// import ApiError from '~/utils/ApiError'

// eslint-disable-next-line no-unused-vars
const createNew = async (req, res, next) => {
  try {
    // console.log('req.body:', req.body)
    // dieu huong du lieu sang tang service
    const createdCard = await cardService.createNew(req.body)
    //   co ket qua thi tra ve client
    // throw new ApiError(StatusCodes.BAD_REQUEST, 'marchisDev test error')
    res.status(StatusCodes.CREATED).json(createdCard)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const updateCard = await cardService.update(cardId, req.body)
    res.status(StatusCodes.OK).json(updateCard)
  } catch (error) {
    next(error)
  }
}

export const cardController = {
  createNew,
  update
}
