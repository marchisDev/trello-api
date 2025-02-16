import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

// Middleware nay se dam bao viec quan trong: xac thuc cai JWT access Token nhan duoc tu phia FE co hop le hay khong

const isAuthorized = async (req, res, next) => {
  // Lay accestoken nam trong request cookies phia client - withCredentials: true trong file authorizeAxios
  const clientAccessToken = req.cookies?.accessToken

  // Neu nhu cai accessToken khong ton tai thi chung ta se tra ve loi 401 Unauthorized
  if (!clientAccessToken) {
    next(
      new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized: Token not found')
    )
    return
  }
  try {
    // B1: thuc hien giai ma token xem no co hop le hay khong
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    )
    // console.log(accessTokenDecoded)
    // B2: Neu nhu cai token hop le thi can phai luu thong tin duoc giai ma vao cai req.jwtDecoded de su dung cho cac tang xu li phia sau
    req.jwtDecoded = accessTokenDecoded
    // B3: Cho phep request di tiep
    next()
  } catch (error) {
    // console.log('error middleware auth', error)
    //   Neu nhu cai accessToken het han (expired) thi chung ta se tra ve ma loi GONE - 410 cho phia FE de phia FE biet de goi api refresh token
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token'))
      return
    }
    //   Neu nhu cai accessToken no khong hop le do bat ki li do nao khac li dp het han thi chung ta se tra ve ma loi 401 cho phia FE de goi api sign_out
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}
