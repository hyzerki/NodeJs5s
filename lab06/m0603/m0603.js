const nodemailer = require('nodemailer');
const smtpTransport = require("nodemailer-smtp-transport");


function send(message, recipient = "hyzerki@gmail.com") {
    let transporter = nodemailer.createTransport(smtpTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: 'hyzerki@gmail.com',
            pass: 'rjzeyafexgnhykgd'
        }
    }));

    let mailOptions = {
        from: "hyzerki@gmail.com",
        to: recipient,
        subject: "Lab 6",
        text: message,
        html: `<i>${message}</i>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        error ? console.log(error) : console.log("Email sent: " + info.response);
    });
}

module.exports = send;