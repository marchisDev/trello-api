import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

const createNew = async (reqBody) => {
  try {
    // Xu li logic du lieu tuy dac thu du an
    const newCard = {
      ...reqBody
    }

    // goi tang model de xu li logic luu vao database
    const createdCard = await cardModel.createNew(newCard)
    // console.log(createdCard)

    // lay ban ghi card sau khi goi (tuy muc dich du an ma co can buoc nay hay khong)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      //   Cap nhat lai mang cardOrderIds trong collection columns
      await columnModel.pushCardOrderIds(getNewCard)
    }
    return getNewCard
  } catch (error) {
    throw error
  }
}

const update = async (cardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedCard = await cardModel.update(cardId, updateData)
    return updatedCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  update
}
