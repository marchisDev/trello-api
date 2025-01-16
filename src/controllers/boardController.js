import { StatusCodes } from 'http-status-codes'

// eslint-disable-next-line no-unused-vars
const createNew = async (req, res, next) => {
  try {
    // eslint-disable-next-line no-console
    console.log('req.body:', req.body)
    // dieu huong du lieu sang tang service

    //   co ket qua thi tra ve client
    res
      .status(StatusCodes.CREATED)
      .json({ message: 'APIs create new board from controller' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: error.message
    })
  }
}

export const boardController = {
  createNew
}
