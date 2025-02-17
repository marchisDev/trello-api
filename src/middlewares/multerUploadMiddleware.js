import { StatusCodes } from 'http-status-codes'
import multer from 'multer'
import ApiError from '~/utils/ApiError'
import {
  ALLOW_COMMON_FILE_TYPES,
  LIMIT_COMMON_FILE_SIZE
} from '~/utils/validators'

// https://www.npmjs.com/package/multer

// Function kiem tra lai file nao duoc chap nhan upload

const customFileFilter = (req, file, callback) => {
//   console.log('Multer file: ', file)

  // Doi voi multer, kiem tra kieu file se su dung mimetype thay vi type
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errorMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage),
      null
    )
  }

  // Neu nhu kieu file hop le
  callback(null, true)
}

// Khoi tao function upload duoc boc boi multer
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

export const multerUploadMiddleware = { upload }