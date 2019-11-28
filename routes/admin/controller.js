"use strict"
import email from './../../service/email'
import redis from './../../service/redis'
import sms from './../../service/sms'
import Token from './../../service/token'
import { dateFormat, md5, randomCode, postDataCheck, isNullVal, printErrorCode } from '../../utils/base'
import { sqlQueryWithParam, sqlQuery } from './../../service/mysql'
import {Decrypt, Encrypt} from './../../utils/aes'

exports.default = function (req, res) {
  res.json({
    code: 200,
    msg: "You are visiting the path of " + req.baseUrl
  })
}

exports.login = async function (req, res) {
  try{
    await checkCaptcha(req,res);//如果有验证码，输入验证码，否则登录
    var data = await userLoginByEmail(req, res);
    var userpass = req.body.userpass;
    if (data.code == 200) {
      let { user_id,user_name,user_icon,auth_banned } = data.data;
      if(data.data.user_pass == userpass){
        let token = Token.generateToken({ user_id,exp:12 });
        res.json({code:200,msg:'登录成功!',data:{user_id,user_name,user_icon,token:token} })
      }else{
        loginFailedProcess(req,res);
      }
    }else{ //用户不存在
      throw new Error(405)
    }
  }catch(code){
    printErrorCode(res, 'verify', code.message)
  }
}
function loginFailedProcess(req,res){
  if(req.session.login_failed_count) {
    let count = ++req.session.login_failed_count;
    if(count >= 3) {
      req.session.openCap = true;
    };
  }
  else {
    req.session.login_failed_count = 1
  };
  res.json({
    code:309,
    msg:getErrorMsg('verify',309),
    strictVerify:req.session.openCap 
  })
}

exports.captcha = function (req, res) {
  const {
    createCanvas,
    registerFont
  } = require('canvas')
  registerFont('./assets/font/DatBox.ttf', {
    family: 'DatBox'
  })
  const canvas = createCanvas(140, 50);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f3fbfe';
  ctx.fillRect(0, 0, 140, 50);

  ctx.font = '48px DatBox'
  ctx.fillStyle = '#888989';
  var text = '';

  for (var i = 0; i < 4; i++) {
    var char = ~~(Math.random() * 10);
    ctx.fillText(char, 5 + 35 * i, 38 + char / 2);
    text += char;
  }
  req.session.captcha = text;
  res.type('png')
  res.end(canvas.toBuffer());
}

function checkCaptcha(req, res) {
  return new Promise((resolve,reject) => {
    if (!isNullVal(req.session.captcha)) {
      var capInSession = req.session.captcha.toString();
      var capInPost = req.body.captcha.toString();
      if (capInPost.toLowerCase() != capInSession.toLowerCase()) {
        reject(new Error(106))
      }
    }
    resolve()
  })
}

async function userLoginByEmail(req) {
  var usermail = req.body.usermail;
  var sql = 'select * from user_info where user_email = ? limit 1';
  var para = [usermail];
  var a = await sqlQueryWithParam(sql, para);
  if(_.isArray(a) && a.length != 0){
    return {code:200,data:a[0]}
  }else{
    return {code:404,data:[]}
  }
}
exports.register = async function (req, res, next) {
  try{
    console.log('register');
    var usermail = req.body.usermail || null;
    var userpass = Decrypt(req.body.userpass) || null;
    var username = req.body.username || null;
    var result = await userLoginByEmail(req);
    if (result.code == 404) {
        checkEmail(req, res, function(){
          var sql = `insert into user_info(user_id,user_name,user_pass,user_email,
                      user_icon,user_phone,user_sex,user_birth,user_reg_time) 
                      values( REPLACE(UUID(),"-","") ,?,?,?,?,?,?,?,?)`;
          var para = [username, Encrypt(userpass), usermail, '', '', '', '', Date.now()];
          sqlQueryWithParam(sql, para).then((result) => {
            if(result.affectedRows > 0){
              res.json({
                code:200,
                msg:'注册成功！'
              })
            }else{
              throw new Error(503);
            }
          })
        });
        
    }else{
      throw new Error(506);
    }
  }catch(code){
    printErrorCode(res, 'verify', code.message)
  }
}



////////////////////////邮箱START
function sendMailFunc(usermail, code, res) {
  email.send(usermail, code, function (cb) {
    redis.set('verify_email_' + md5(usermail), JSON.stringify({
      code: code,
      expiredTime: Date.now() + 1000 * 60 * 10,//有效期
      nextReqTime: Date.now() + 1000 * 60 * 1,//下次请求时间
    }));
    if (cb.code == 200) {
      res.json({
        code: 200,
        msg: '验证码已发送,请尽快进入邮箱查看'
      })
    } else {
      if (cb.info.responseCode == 550) {
        printErrorCode(res, 'verify', 550)
      } else {
        printErrorCode(res, 'verify', 530)
      }
    }
  })
}
exports.sendEmailCap = async function (req, res) {
  var usermail = req.query.usermail || null;
  var curTime = Date.now();
  var code = randomCode();
  redis.get('verify_email_' + md5(usermail), function (err, value) {
    if (err) res.json({ code: 500, msg: err });
    if (value){
      var data = JSON.parse(value);
      if (curTime < data.nextReqTime) {
        res.json({
          code: 104,
          msg: '验证码发送过于频繁, 请于' + Math.floor((data.nextReqTime - curTime) / 1000)  + "秒之后发送"
        })
      }else{
        sendMailFunc(usermail, code, res);
      }
    }else{
      sendMailFunc(usermail, code, res);
    }
  })
}

 function checkEmail(req, res, cb) {
  var usermail = req.body.usermail || null;
  var code = req.body.code || null;
  redis.get('verify_email_' + md5(usermail), function (err, value) {
    console.log('redis :error ' + err);
    if (err) res.json({
      code: 500,
      msg: err
    });
    var data =  JSON.parse(value);
    if(isNullVal(data))  printErrorCode(res, 'verify', 520)
    else{
      if (Date.now() >= data.expiredTime) {
        printErrorCode(res, 'verify', 531)
      } else {
        if (data.code == code) {
          cb()
        } else {
          printErrorCode(res, 'verify', 532)
        }
      }
    }
  })
}
///////////////////邮箱END

// exports.sms = function (req, res) {
//   sms.send('17720717154', randomCode(6), function (err, data) {
//     if (!err && data.result == 0) {
//       res.json({
//         code: 200,
//         msg: '验证码发送成功,请及时输入!'
//       });
//       sqlQuery()
//     }
//   })
// }