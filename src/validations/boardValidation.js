import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'


const createNew = async (req, res, next) => {
  // BE bat buoc phai validate du lieu dau vao
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title must not empty',
      'string.min': 'Title must have at least 3 characters',
      'string.max': 'Title must have at most 50 characters',
      'string.trim': 'Title must not contain leading or trailing spaces'
    }),
    description: Joi.string().required().min(3).max(255).trim().strict()
  })

  try {
    // TH co nhieu loi validation thi tra ve tat ca loi
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // Validate du lieu xong xuoi hop le thi cho request di tipe sang Controller tiep theo
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const boardValidation = {
  createNew
}
