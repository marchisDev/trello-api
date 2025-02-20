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

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)
    // console.log(getInvitations)

    // vi cac du lieu inviter, invitee, board la dang o gia tri 1 mang 1 phan tu neu lay ra duoc nen chung ta
    // se bien doi no ve Json Object truoc khi tra ve chp phia FE
    const resInvitations = getInvitations.map((i) => {
      return {
        ...i,
        inviter: i.inviter[0] || {},
        invitee: i.invitee[0] || {},
        board: i.board[0] || {}
      }
    })

    return resInvitations
  } catch (error) {
    throw error
  }
}

export const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    // tim ban ghi invitation trong model
    const getInvitation = await invitationModel.findOneById(invitationId)
    if (!getInvitation) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found')
    }

    // sau khi co Invitation roi thi lay full thong tin cua board
    const boardId = getInvitation.boardInvitation.boardId
    const getBoard = await boardModel.findOneById(boardId)
    if (!getBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    // Kiem tra xem neu status la ACCEPTED join board ma cai th user (invitee) da la owner hoac member cua
    // board roi thi tra ve thong bao loi luon
    // Note: 2 mang memberIds va ownerIds cua board deu la ObjectId nen tra ve kieu String luon de check
    const boardOWnerAndMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds].toString()
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOWnerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member of this board')
    }

    // Tao du lieu de update ban ghi Invitation
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status: status
      }
    }

    // B1: Cap nhat status trong ban ghoi Invitation
    const updatedInvitation = await invitationModel.update(invitationId, updateData)
    // B2: Neu TH Accepted 1 loi moi thanh cong, thi can phai them thong tin cua thanh
    // user(userId) vao ban ghi memberIds trong collection Board
    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMemberIds(boardId, userId)
    }

    return updatedInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}
