import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // Nguoi di moi chinh la nguoi dang request nen chung ta se tim theo id lay tu token
    const inviter = await userModel.findOneById(inviterId)
    // Nguoi duoc moi: lay theo email nhan duoc tu phia FE
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
    // Tim luon cai board ra de lay data xu li
    const board = await boardModel.findOneById(reqBody.boardId)

    // Neu khong ton tai 1 trong 3 thi cu thang tay reject
    if (!inviter || !invitee || !board) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Inviter, Invitee or Board not found'
      )
    }

    // Tao data can thiet de luu vao DB
    // Co the thu bo hoac lam sai leech type, boardInvitation, status de test xem Model validate oke chua
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(), // chuyen tu ObjectId ve String vi sang ben ham model co check lai data o ham create
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }

    //   Goi sang Model de luu vao DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(
      newInvitationData
    )
    const getInvitation = await invitationModel.findOneById(
      createdInvitation.insertedId
    )

    //   Ngoai thong tin cua cai board invitation moi tao thi tra ve du ca luon board, inviter, invitee cho FE thoai mai xu li
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }
    return resInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewBoardInvitation
}
