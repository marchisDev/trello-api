import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'

// Define collection name
const INVITATION_COLLECTION_NAME = 'invitations'
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  inviteeId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  //   kieu cua loi moi
  /**
   * Tips: thay vi goi lan luot tat ca type cua board de cho vao ham valid() thi co the viet gon lai
   * bang Object.values() ket hop spead operator cua JS. cu the: .valid(...Object.values(BOARD_TYPES))
   * Lam nhu the thi sau nay du cho co them hay sua gi vao cai BOARD_TYPES trong file constants.js
   * thi o nhung cho dung Joi trong model hay validation cung khong can phai dung vao nua.
   */
  type: Joi.string().valid(...Object.values(INVITATION_TYPES)),

  // Loi moi la board thi se luu them du lieu boardInvitation - optional
  boardInvitation: Joi.object({
    boardId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now()),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Chi dinh nhung field ma chung ta khong cho phep cap nhat trong ham update
const INVALID_UPDATE_FIELDS = [
  '_id',
  'inviterId',
  'inviteeId',
  'type',
  'createdAt'
]

const validateBeforeCreate = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

const createNewBoardInvitation = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    // bien doi 1 so du lieu lien quan toi ObjectId chuan chinh
    let newInvitationToAdd = {
      ...validData,
      inviterId: new ObjectId(validData.inviterId),
      inviteeId: new ObjectId(validData.inviteeId)
    }
    // neu ton tai du lieu boardInvitation thi update cho cai boardId
    if (validData.boardInvitation) {
      newInvitationToAdd.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(validData.boardInvitation.boardId)
      }
    }
    // Goi insert vao DB
    const createInvitation = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .insertOne(newInvitationToAdd)
    return createInvitation
  } catch (error) {
    throw new error()
  }
}

const findOneById = async (invitationId) => {
  try {
    const result = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(invitationId) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (invitationId, updateData) => {
  try {
    // Loc nhung field khong duoc update
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    // Doi voi nhung du lieu lien quan toi ObjectId, can phai chuyen doi o day
    if (updateData.boardInvitation) {
      updateData.boardInvitation = {
        ...updateData.boardInvitation,
        boardId: new ObjectId(updateData.boardInvitation.boardId)
      }
    }

    const result = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(invitationId) },
        { $set: updateData },
        { returnDocument: 'after' }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  createNewBoardInvitation,
  findOneById,
  update
}
