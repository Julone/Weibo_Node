const request = require('request');
const crypto = require('crypto');

const config = {
    url: 'https://live.kewail.com/sms/v1/sendsinglesms',
    accesskey: '5d819a6787b65f1f37d6cc83',  // 根据实际填 accesskey
    secretkey: 'b9e9b328ed43453da397ab820e23fd40',  // 根据实际填 secretkey
};

let sms = {
    getRandom(lower = 100000, upper = 999999) {
        return Math.floor(Math.random() * (upper - lower)) + lower;
    },
    sig(mobile, random, curTime) {
        let hash = crypto.createHash('sha256');
        hash.update('secretkey='+config.secretkey+
                    '&random='+random+
                    '&time='+curTime+
                    '&mobile='+mobile);

        return hash.digest('hex').toUpperCase();
    },
    send(mobile,code,callback) {
        let self = this;

        let curTime = Math.floor(Date.now()/1000);
        let random = self.getRandom();

        let data = {
            sig: self.sig(mobile, random, curTime),
            ext: '',
            extend:'',
            time: curTime,
            msg:'【JULONE】你的验证码是' + code + ', 请输入验证码完成验证，如有问题请联系客服。',
            type:0,
            tel:{
                nationcode: "86", //国家码
                mobile: mobile //手机号码
            }
        };
        request({
            url: config.url+'?accesskey='+config.accesskey+'&random='+random,
            method: 'POST',
            json: data
        }, (err, res, body) => {
            callback(body);
        });
    }
};
module.exports = sms;