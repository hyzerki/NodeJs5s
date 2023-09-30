const http = require("http");
const url = require("url");
const fs = require("fs");
const qs = require('querystring');
const nodemailer = require('nodemailer');
const smtpTransport = require("nodemailer-smtp-transport");


const sender = 'hyzerki@gmail.com';
const pass = 'rjzeyafexgnhykgd';

function send(message, recipient = sender) {
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
        from: sender,
        to: recipient,
        subject: "Lab 6",
        text: message,
        html: `<i>${message}</i>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        error ? console.log(error) : console.log("Email sent: " + info.response);
    });
}


http.createServer(async (request, response) => {
    if (url.parse(request.url).pathname == "/") {
        fs.createReadStream("index.html").pipe(response);
    }
    else if (url.parse(request.url).pathname == "/sendmail" && request.method == "POST") {
        const buffers = [];
        for await (const chunk of request) {
            buffers.push(chunk);
        }
        const requestBody = Buffer.concat(buffers).toString();
        let post = qs.parse(requestBody);
        send(`${post.sender}<br>${post.message}`);
        response.end(`<h1>OK: ${post.sender}, ${post.message}, ${sender}`);
    }
    else {
        response.writeHead(404);
        response.end();
    }
}).listen(3000);