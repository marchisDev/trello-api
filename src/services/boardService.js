import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    // Xu li logic du lieu tuy dac thu du an
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // goi tang model de xu li logic luu vao database
    const createdBoard = await boardModel.createNew(newBoard)
    // console.log(createdBoard)

    // lay ban ghi board sau khi goi (tuy muc dich du an ma co can buoc nay hay khong)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    // lam them cac xu li logic voi cac collection khac tuy dac thu du an,...
    // ban email, notification, log, ... ve cho admin khi co 1 board duoc tao moi

    //   trong service luon phai co return de tra ve ket qua cho controller
    return getNewBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew
}
