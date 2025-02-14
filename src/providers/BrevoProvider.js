const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customSubject, customHtmlContent) => {
  // Khoi tao sendSmtpEmail
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

  // Thiet lap thong tin nguoi gui
  // Tai khoan gui mail: luu y dia chi admin email phai la email tao tai khoan tren Brevo
  sendSmtpEmail.sender = {
    name: env.ADMIN_EMAIL_NAME,
    email: env.ADMIN_EMAIL_ADDRESS
  }

  // Thiet lap thong tin nguoi nhan
  sendSmtpEmail.to = [
    {
      email: recipientEmail
    }
  ]
  // Thiet lap tieu de email
  sendSmtpEmail.subject = customSubject
  // Thiet lap noi dung email
  sendSmtpEmail.htmlContent = customHtmlContent
  // Goi API de gui email
  // sendTransacEmail cua thu vien se return mot promise
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}
