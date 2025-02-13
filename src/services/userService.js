import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptis from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'

const createNew = async (reqBody) => {
  try {
    //   Kiem tra xem email da ton tai chua
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
    }
    // Tao data de luu vao DB
    //   nameFromEmail dung de lay ten tu email: neu email la marchisdev@gmail.com thi ta se lay duoc "marchisdev"
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptis.hashSync(reqBody.password, 8), // tham so thu 2 la do phuc tap cua hash
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    //   Thuc hien luu thong tin user vai DB
    const createdUser = await userModel.createNew(newUser)
    // lay ban ghi board sau khi goi (tuy muc dich du an ma co can buoc nay hay khong)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)
    // Gui email cho nguoi dung xac thuc tai khoan

    //   return tra ve du lieu cho Controller
    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew
}
