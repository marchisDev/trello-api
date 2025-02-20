import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { pagingSkipValue } from '~/utils/algorithms'
import { userModel } from './userModel'

// define Collection Schema
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(255).trim().strict(),

  /**
   * Tips: thay vi goi lan luot tat ca type cua board de cho vao ham valid() thi co the viet gon lai
   * bang Object.values() ket hop spead operator cua JS. cu the: .valid(...Object.values(BOARD_TYPES))
   * Lam nhu the thi sau nay du cho co them hay sua gi vao cai BOARD_TYPES trong file constants.js
   * thi o nhung cho dung Joi trong model hay validation cung khong can phai dung vao nua.
   */
  type: Joi.string().required().valid(...Object.values(BOARD_TYPES)),
  // type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  ownerIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  memberIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now()),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// chi dinh ra nhung field khong duoc update trong ham update
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(userId)]
    }

    const createdBoard = GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne(newBoardToAdd)
    return createdBoard
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (boardId) => {
  try {
    // console.log('id: ', id)
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(boardId) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// query tong hop (aggregate) du lieu de lay toan bo columns va card thuoc ve board
const getDetails = async (userId, boardId) => {
  try {
    const queryCondition = [
      { _id: new ObjectId(boardId) },
      // Dk1: Board chua bi xoa
      { _destroy: false },
      // Dk2: cai thang userId dang thuc hien request phai thuoc 1 trong 2 mang ownerIds hoac memberIds
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } }
        ]
      }
    ]

    // const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: queryCondition } },
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'columns'
          }
        },
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'cards'
          }
          // eslint-disable-next-line comma-dangle
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'ownerIds',
            foreignField: '_id',
            as: 'owners',
            // pipeline trong lookup la de xu li 1 or nhieu luong can thiet
            // $project: chi lay ra nhung field khong muon lay bang cach gan no gia tri bang 0
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'memberIds',
            foreignField: '_id',
            as: 'members',
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
          }
        }
      ])
      .toArray()
    // console.log('result: ', result)
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

// Nhiem vu cua function nay la cpush mot 1 gia tri columnId vao cuoi mang columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { $push: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Lay 1 phan tu columnId ra khoi mang columnOrderIds
// https://www.mongodb.com/docs/manual/reference/operator/update/pull/#mongodb-update-up.-pull
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { $pull: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, updateData) => {
  try {
    // loc nhung field khong duoc update
    Object.keys(updateData).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete updateData[key]
      }
    })

    // Doi voi nhung du ;ieu lien quan den ObjectId, can phai chuyen doi
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(
        (_id) => new ObjectId(_id)
      )
    }

    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(boardId) },
        { $set: updateData },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryCondition = [
      // Dk1: Board chua bi xoa
      { _destroy: false },
      // Dk2: cai thang userId dang thuc hien request phai thuoc 1 trong 2 mang ownerIds hoac memberIds
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } }
        ]
      }
    ]

    const query = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate(
        [
          { $match: { $and: queryCondition } },
          // sort title cua board theo A-Z (Mac dinh chu B hoa se dung truoc chu a thuong)
          { $sort: { title: 1 } },
          // $facet: xu li nhieu luong trong 1 query
          {
            $facet: {
              // Luong 01: Query Boards
              queryBoards: [
                { $skip: pagingSkipValue(page, itemsPerPage) }, // bo qua so luong ban ghi cua nhung page truoc do
                { $limit: itemsPerPage } // gioi han toi da so luong ban ghi tra ve tren 1 page
              ],
              // Luong 02: Query dem tong all so luong ban ghi boards trong DB va tra ve vao bien countedAllBoards
              queryTotalBoards: [{ $count: 'countedAllBoards' }]
            }
          }
        ],
        // Khai bao them thuoc tinh collection locale 'en' de fix vu chu B hoa va chu a thuong o tren
        { collation: { locale: 'en', strength: 2 } } // Thêm tùy chọn collation
      )
      .toArray()
    // console.log('query: ', query)

    const res = query[0]

    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) {
    throw new Error(error)
  }
}

const pushMemberIds = async (boardId, userId) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(boardId) },
        { $push: { memberIds: new ObjectId(userId) } },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
  getBoards,
  pushMemberIds
}
