import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'

const createNew = async (reqBody) => {
  try {
    // Xu li logic du lieu tuy dac thu du an
    const newColumn = {
      ...reqBody,
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

export const columnService = {
  createNew,
}
