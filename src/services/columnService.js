import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
  try {
    // Xu li logic du lieu tuy dac thu du an
    const newColumn = {
      ...reqBody
    }

    // goi tang model de xu li logic luu vao database
    const createdColumn = await columnModel.createNew(newColumn)
    // console.log(createdColumn)

    // lay ban ghi column sau khi goi (tuy muc dich du an ma co can buoc nay hay khong)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    if (getNewColumn) {
      // Xu li cau truc data truoc khi tra data ve
      getNewColumn.cards = []

      //   Cap nhat lai mang ColumnOrderIds trong collection boards
      await boardModel.pushColumnOrderIds(getNewColumn)
    }

    return getNewColumn
  } catch (error) {
    throw error
  }
}

const update = async (columnId, reqBody) => {
  try {
    const updateData = { ...reqBody, updatedAt: Date.now() }

    // lay ban ghi board sau khi goi (tuy muc dich du an ma co can buoc nay hay khong)
    const updatedColumn = await columnModel.update(columnId, updateData)

    // console.log('columnId service:', columnId)
    return updatedColumn
  } catch (error) {
    throw error
  }
}

const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)

    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')
    }
    // https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/write-operations/delete/
    //  xoa column
    await columnModel.deleteOneById(columnId)
    // xoa toan card thuoc column tren
    await cardModel.deleteManyByColumnId(columnId)

    // xoa columnId trong mang columnOrderIds cua board
    await boardModel.pullColumnOrderIds(targetColumn)

    return { deleteResult: 'Delete column and its cards successfully' }
  } catch (error) {
    throw error
  }
}


export const columnService = {
  createNew,
  update,
  deleteItem
}
