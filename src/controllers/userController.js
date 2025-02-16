import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'
import ms from 'ms'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  try {
    // dieu huong du lieu sang tang service
    const createdUser = await userService.createNew(req.body)
    //   co ket qua thi tra ve client
    // throw new ApiError(StatusCodes.BAD_REQUEST, 'marchisDev test error')
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) {
    next(error)
  }
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

const logout = async (req, res, next) => {
  try {
    // Xoa cookie tren client - don gian la lam nguoc lai so voi viec gan cookie o ham login
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.OK).json({ loggedOut: true })
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14days')
    })
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'Please sign in! (Error from refreshToken)'))
  }
}

export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken
}
