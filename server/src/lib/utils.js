const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
    user: 'richardgeek017@gmail.com',
    pass: `${process.env.GMAIL_SMTP_PASSWORD}`,
},
});

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

const sendWelcomeEmail = (email) => {

    const mailOptions = {
    from: '"Opportune" <richardgeek017@gmail.com>',
    to: `${email}`,
    subject: 'Welcome To Opportune',
    text: 'Welcome to Opportune, a place where talents are connected with Opportunities',
    };

    transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('Error sending email:', error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });

}

module.exports = { getTokenFrom, sendWelcomeEmail }
