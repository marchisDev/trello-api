import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'

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

const getDetails = async (boardId) => {
  // eslint-disable-next-line no-useless-catch
  try {


    // lay ban ghi board sau khi goi (tuy muc dich du an ma co can buoc nay hay khong)
    const board = await boardModel.getDetails(boardId)

    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    // Clone ra mot board hoan toan moi de xu li, khong anh huong toi board ban dau, tuy muc  dich su dung ve sau ma
    // co can cloneDeep hay la khong
    const resBoard = cloneDeep(board)
    // Dua card ve dung column cua no
    resBoard.columns.forEach((column) => {
      // cach dung .equals nay la boi cta hieu ObjectId cua mongoDB co method support equals
      column.cards = resBoard.cards.filter((card) => card.columnId.equals(column._id))
      // column.cards = resBoard.cards.filter((card) => card.columnId.toString() === column._id.toString())
    })

    // Xoa field cards ra khoi board ban dau
    delete resBoard.cards
    return resBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails
}
