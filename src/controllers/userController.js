import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'
import ms from 'ms'

const createNew = async (req, res, next) => {
  try {
    // dieu huong du lieu sang tang service
    const createdUser = await userService.createNew(req.body)
    //   co ket qua thi tra ve client
    // throw new ApiError(StatusCodes.BAD_REQUEST, 'marchisDev test error')
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) { next(error) }
}

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)

    /**
 * Xu li tra ve http only cookie cho client
 * doi voi maxAge - thoi gian song cua cookie thi chung ta co the de toi da 14 ngay tuy du an
 * Luu y thoi gian song cua cookie khac voi thoi gian xong cua token
 */
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14days')
    })
    res.cookie('refreshToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14days')
    })
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createNew,
  verifyAccount,
  login
}