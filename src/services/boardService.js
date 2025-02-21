import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'

const createNew = async (userId, reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    // Xu li logic du lieu tuy dac thu du an
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // goi tang model de xu li logic luu vao database
    const createdBoard = await boardModel.createNew(userId, newBoard)
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

const getDetails = async (userId, boardId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    // lay ban ghi board sau khi goi (tuy muc dich du an ma co can buoc nay hay khong)
    const board = await boardModel.getDetails(userId, boardId)

    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    // Clone ra mot board hoan toan moi de xu li, khong anh huong toi board ban dau, tuy muc  dich su dung ve sau ma
    // co can cloneDeep hay la khong
    const resBoard = cloneDeep(board)
    // Dua card ve dung column cua no
    resBoard.columns.forEach((column) => {
      // cach dung .equals nay la boi cta hieu ObjectId cua mongoDB co method support equals
      column.cards = resBoard.cards.filter((card) =>
        card.columnId.equals(column._id)
      )
      // column.cards = resBoard.cards.filter((card) => card.columnId.toString() === column._id.toString())
    })

    // Xoa field cards ra khoi board ban dau
    delete resBoard.cards
    return resBoard
  } catch (error) {
    throw error
  }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = { ...reqBody, updatedAt: Date.now() }

    // lay ban ghi board sau khi goi (tuy muc dich du an ma co can buoc nay hay khong)
    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) {
    throw error
  }
}

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    // B1: Cap nhat lai mang cardOrderIds cua column ban dau chua no (xoa _id cua card khoi mang)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })
    // B2: Cap nhat lai mang cardOrderIds cua column chua no (them _id cua card vao cuoi mang)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })
    // B3: Cap nhat lai truong ColumnId cua card da keo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId,
      updatedAt: Date.now()
    })
    return { updateResult: 'Successfully' }
  } catch (error) {
    throw error
  }
}

const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
  try {
    // Neu khong ton tai page hoac itemsPerPage tu phia FE thi BE se can phia luon gan gia tri mac dinh
    if (!page) {
      page = DEFAULT_PAGE
    }
    if (!itemsPerPage) {
      itemsPerPage = DEFAULT_ITEMS_PER_PAGE
    }

    const results = await boardModel.getBoards(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10),
      queryFilters
    )

    return results
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
}
