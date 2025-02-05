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

const update = async (req, res, next) => {
  try {
    const columnId = req.params.id
    // console.log('columnId controller:', columnId)

    const updatedColumn = await columnService.update(columnId, req.body)
    //   co ket qua thi tra ve client
    // throw new ApiError(StatusCodes.BAD_REQUEST, 'marchisDev test error')
    res.status(StatusCodes.OK).json(updatedColumn)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const columnId = req.params.id
    // console.log('columnId controller:', columnId)

    const result = await columnService.deleteItem(columnId)
    //   co ket qua thi tra ve client
    // throw new ApiError(StatusCodes.BAD_REQUEST, 'marchisDev test error')
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}


export const columnController = {
  createNew,
  update,
  deleteItem
}
