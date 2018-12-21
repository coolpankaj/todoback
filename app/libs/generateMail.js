const nodemailer = require('nodemailer')



let generateMail = (email, name, bodyMessage) => {

// sending mail after completing main thread
console.log('signUp mail Credentials obtained, sending message...');

// Create a SMTP transporter object
   const transporter = nodemailer.createTransport({
       host: 'smtp.gmail.com',
       port: 465,
       secure: true,
       auth: {
           user: 'tempmailidtempmailid@gmail.com',
           pass: 'tempmail@123'
       }
 });

   // Message object
   let message = {
       from: 'tempmailidtempmailid@gmail.com',
       to: email,
       subject: 'Chat Application',
       text: 'Welcome to our app!',
       html: "<p>Hii!!"+ name + ".<br>" + bodyMessage
   };

   transporter.sendMail(message, (err, info) => {
       if (err) {
           console.log('Error occurred. ' + err.message);
           return process.exit(1);
       }
       console.log('Message sent: %s', info.messageId);
       
   });
}

let passwordChanged = (email, bodyMessage) => {

    // sending mail after completing main thread
    console.log('Credentials obtained, password changed sending message...');
    
    // Create a SMTP transporter object
       const transporter = nodemailer.createTransport({
           host: 'smtp.gmail.com',
           port: 465,
           secure: true,
           auth: {
               user: 'tempmailidtempmailid@gmail.com',
               pass: 'tempmail@123'
           }
     });
    
       // Message object
       let message = {
           from: 'tempmailidtempmailid@gmail.com',
           to: email,
           subject: 'Chat Application',
           text: 'Welcome to our app!',
           html: bodyMessage
       };
    
       transporter.sendMail(message, (err, info) => {
           if (err) {
               console.log('Error occurred. ' + err.message);
               return process.exit(1);
           }
           console.log('Message sent: %s', info.messageId);
           console.log("=============================================")
           
       });
    }

    

let generateVerifyCode = (email, name, verificationCode) => {

    // sending mail after completing main thread
    console.log('verifying code Credentials obtained, sending message...');
    // console.log("email" + email+ "receipient name" + name + "verification code"+ verificationCode)
    
    // Create a SMTP transporter object
       const transporter = nodemailer.createTransport({
           host: 'smtp.gmail.com',
           port: 465,
           secure: true,
           auth: {
               user: 'tempmailidtempmailid@gmail.com',
               pass: 'tempmail@123'
           }
     });
    
       // Message object
       let message = {
           from: 'tempmailidtempmailid@gmail.com',
           to: email,
           subject: 'Chat Application',
           text: 'Verification Code!',
           html: "<p>Hii!!  <b>"+ name + "</b>.<br>" + "Hope you are enjoying our service.<br><br>Your verification code is <b>"+verificationCode+"</b>."
       };
    
       transporter.sendMail(message, (err, info) => {
           if (err) {
               console.log('Error occurred. ' + err.message);
               return process.exit(1);
           }
           console.log('Message sent: %s', info.messageId);
           
       });
    }



   module.exports = {
       generateMail: generateMail,
       generateVerifyCode: generateVerifyCode,
       passwordChanged: passwordChanged
   }