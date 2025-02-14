// https://www.npmjs.com/package/jsonwebtoken
import JWT from 'jsonwebtoken'

/**
 * Funtion tao moi mot token - can 3 tham so dau vao
 * userInfor: Nhung thong tin muon dinh kem trong token
 * secretSignature: Chu ki bi mat(mot dang chuoi string ngau nhien) trong docs thi de ten la privateKey deu duoc
 * tokenLife: Thoi gian ton tai cua token
 */
const generateToken = async (userInfor, secretSignature, tokenLife) => {
  try {
    return JWT.sign(userInfor, secretSignature, {
      algorithm: 'HS256',
      expiresIn: tokenLife
    })
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Function kiem tra token co hop le hay khong
 * Hop le o day hieu don gian la cai token duoc tao ra co dung voi cai chu ki secretSignature ma minh tao ra hay khong
 */

const verifyToken = async (token, secretSignature) => {
  try {
    // ham verify cua thu vien JWT
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}
