import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  // BE bat buoc phai validate du lieu dau vao
  const correctCondition = Joi.object({
    boardId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    columnId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim().strict()
  })

  try {
    // TH co nhieu loi validation thi tra ve tat ca loi
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // Validate du lieu xong xuoi hop le thi cho request di tipe sang Controller tiep theo
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage
    )
    next(customError)
  }
}

const update = async (req, res, next) => {
  // Luu y khong dung require() trong TH update
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().optional()
  })

  try {
    // Chi dinh abortEarly: false de TH co nhieu loi validation thi tra ve tat ca loi
    // Doi vs TH update cho phep Unknown de khong can day 1 so field len
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    )
  }
}

export const cardValidation = {
  createNew,
  update
}
