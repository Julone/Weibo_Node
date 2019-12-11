const jwt = require('jsonwebtoken');
export default {
    secretKey:'julone',
    generateToken({user_id, exp = 0}) {
        let hour =  (60 * 60);
        let content = {
            userid: user_id,
            exp: (exp * hour ||  2 * hour) +  Math.floor(Date.now() / 1000) //默认2小时
        }
        console.log(content);
        let token = jwt.sign(content, this.secretKey);
        return token;
    },
    verifyToken(token) {
        let secretKey = this.secretKey;
        return jwt.verify(token, secretKey, function (err, decode) {
            if(err){
                if (err.name == 'TokenExpiredError') {        
                    return {
                        code: 403,
                        msg: '身份令牌已经过期,请重新登录!'
                    }
                }else{
                    return {
                        code:429,
                        msg: '该操作需要身份令牌,请重新登录!'
                    }
                }
            }
            else {
                return {
                    code: 200,
                    msg: '验证成功',
                    userid:decode.userid
                }
            }
        })
    }
}