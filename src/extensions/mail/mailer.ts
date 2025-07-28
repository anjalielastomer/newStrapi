import nodemailer from 'nodemailer'

export default {
  transport: nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: ((process.env.SMTP_SECURE || 'false') === 'true'),
    auth: {
      user: process.env.SMTP_USERNAME || 'vicky98@ethereal.email',
      pass: process.env.SMTP_PASSWORD || '899R6xe8dMDZE271ud',
    },
    tls: {
      ciphers: 'SSLv3'
    },
  }),
  defaultParams: {
    from: process.env.SMTP_FULL_NAME && process.env.SMTP_USERNAME
      ? `${process.env.SMTP_FULL_NAME} <${process.env.SMTP_USERNAME}>`
      : `Vicky D'Amore <vicky98@ethereal.email>`,
    to: process.env.SMTP_TO_DEFAULT || 'no-reply@example.com'
  }
};