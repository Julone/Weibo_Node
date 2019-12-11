const nodemailer = require('nodemailer');
const config = {
    host: 'smtp.qq.com',
    port: 465,
    auth: {
        user: 'julone@qq.com',
        pass: 'emjqxrbrdjfdbidh'
    }
};
let transporter = nodemailer.createTransport(config);
//邮件内容
let mail = {
    transporter: transporter,
    send(mail, content, callback) {
        let mailOptions = {
            from: config.auth.user, // 发送方邮箱
            to: mail, // list of receivers
            subject: 'JULONE验证码√', // Subject line
            // text: `${content}`, // plain text body
            html: `你的邮箱验证码为: <b>${content}</b> ,有效期为十分钟,请尽快进行验证!` // html body   
        }

        this.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                callback({code:-1,info:error}); // 失败
            }else{
                callback({code:200,info:info}); // 成功
            }
        });
    }
}
module.exports = mail;