import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'

const createNew = async (reqBody) => {
  try {
    // Kiểm tra xem email đã tồn tại chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
    }
    // Tạo data để lưu vào DB
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), // tham số thứ 2 là độ phức tạp của hash
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    // Thực hiện lưu thông tin user vào DB
    const createdUser = await userModel.createNew(newUser)
    // Lấy bản ghi user sau khi gọi (tùy mục đích dự án mà có cần bước này hay không)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)
    // Gửi email cho người dùng xác thực tài khoản
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject =
      'Trello Account Verification: Please verify your email before using our services'
    const htmlContent = `
    <h3>Here is your verification link:</h3>
    <h3>${verificationLink}</h3>
    <h3>Sincerely, <br/> MarchisDev - Author of Trello</h3>
    `
    // Gọi tới Provider gửi mail
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)
    // Trả về dữ liệu cho Controller
    return pickUser(getNewUser)
  } catch (error) {
    // console.error('Error in createNew userService:', error)
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'HTTP request failed')
  }
}

const verifyAccount = async (reqBody) => {
  try {
    // Query user tu DB
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // cac buoc kiem tra can thiet
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
    }
    if (existUser.isActive) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Your account is already active'
      )
    }
    if (reqBody.token !== existUser.verifyToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token')
    }

    // neu moi thu oke thi chung ta bat dau update lai thong tin cua user de verify account
    const updateData = {
      isActive: true,
      verifyToken: null
    }

    // cap nhat lai thong tin user
    const updatedUser = await userModel.update(existUser._id, updateData)

    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    // Query user tu DB
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // cac buoc kiem tra can thiet
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
    }
    if (!existUser.isActive) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Your account is not active'
      )
    }
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Your Email or Password is incorrect'
      )
    }

    // Neu moi thu oke thi chung ta bat dau tao Token dang nhap tra ve cho FE
    // Tao thong tin de dinh kem trong JWT Token bao gom _id va email cua user
    const userInfo = {
      _id: existUser._id,
      email: existUser.email
    }
    // Tao ra 2 loai token: access token va refresh token de tra ve cho phia FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    )
    // Tra ve thong tin cua user kem theo 2 cai token vua tao ra
    return {
      accessToken,
      refreshToken,
      ...pickUser(existUser)
    }
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login
}
