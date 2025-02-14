import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptis from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'

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
      password: bcryptis.hashSync(reqBody.password, 8), // tham số thứ 2 là độ phức tạp của hash
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
    const customSubject = 'Trello Account Verification: Please verify your email before using our services'
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

export const userService = {
  createNew
}