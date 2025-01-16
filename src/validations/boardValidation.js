import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

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
    // console.log('req.body:', req.body)
    // TH co nhieu loi validation thi tra ve tat ca loi
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    //   next()
    res
      .status(StatusCodes.CREATED)
      .json({ message: 'APIs create new board from validation' })
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(error).message
    })
  }
}

export const boardValidation = {
  createNew
}
