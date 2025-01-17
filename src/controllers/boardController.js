import { StatusCodes } from 'http-status-codes'
// import ApiError from '~/utils/ApiError'

// eslint-disable-next-line no-unused-vars
const createNew = async (req, res, next) => {
  try {
    // eslint-disable-next-line no-console
    console.log('req.body:', req.body)
    // dieu huong du lieu sang tang service

    //   co ket qua thi tra ve client
    // throw new ApiError(StatusCodes.BAD_REQUEST, 'marchisDev test error')
    res
      .status(StatusCodes.CREATED)
      .json({ message: 'APIs create new board from controller' })
  } catch (error) { next(error) }
}

export const boardController = {
  createNew
}
