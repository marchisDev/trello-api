import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'
// import ApiError from '~/utils/ApiError'

// eslint-disable-next-line no-unused-vars
const createNew = async (req, res, next) => {
  try {
    // console.log('req.body:', req.body)
    // dieu huong du lieu sang tang service
    const createdColumn = await columnService.createNew(req.body)
    //   co ket qua thi tra ve client
    // throw new ApiError(StatusCodes.BAD_REQUEST, 'marchisDev test error')
    res.status(StatusCodes.CREATED).json(createdColumn)
  } catch (error) { next(error) }
}


export const columnController = {
  createNew,
}
