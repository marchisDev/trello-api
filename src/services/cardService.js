import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

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

const update = async (cardId, reqBody, cardCoverFile, userInfor) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}
    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(
        cardCoverFile.buffer,
        'card-covers'
      )

      // Luu lai url (secure_url) cua cua cai file anh vao trong DB
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      })
    } else if (updateData.commentToAdd) {
      // Tao du lieu comment de them vao DB, can bo sung nhung field can thiet
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfor._id,
        userEmail: userInfor.email
      }
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
      // TH add hoac remove thanh vien ra khoi card
    } else if (updateData.incomingMemberInfo) {
      updatedCard = await cardModel.updateMembers(cardId, updateData.incomingMemberInfo)
    } else {
      // Cac TH update chung nhu title, description, ...
      updatedCard = await cardModel.update(cardId, updateData)
    }
    return updatedCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  update
}
