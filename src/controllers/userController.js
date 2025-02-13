import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'

const createNew = async (req, res, next) => {
  try {
    // dieu huong du lieu sang tang service
    const createdUser = await userService.createNew(req.body)
    //   co ket qua thi tra ve client
    // throw new ApiError(StatusCodes.BAD_REQUEST, 'marchisDev test error')
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) { next(error) }
}

export const userController = {
  createNew
}