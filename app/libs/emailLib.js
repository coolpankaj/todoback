'use strict';

const nodemailer = require('nodemailer');


let sendEmail = (sendEmailOptions) => {

    let account = {
        user: 'pankajsaini982134@gmail.com ', //emailid
        pass: '********'  //password
    }

    let transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: account.user, 
            pass: account.pass 
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Welcome to todoApp" pankajsaini982134@gmail.com', // sender address
        to: sendEmailOptions.email, // list of receivers
        subject: sendEmailOptions.subject, // Subject line
        text: `Dear ${sendEmailOptions.name},
               Welcome to todoApp, Now all your task at one place. Let's go
        `, // plain text body
        html: sendEmailOptions.html // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        else{
            console.log('Message successfully sent.', info);
        }
       
    });

}

module.exports = {
    sendEmail: sendEmail
  }
