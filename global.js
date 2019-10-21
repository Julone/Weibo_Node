global._ = require('underscore');
global.postDataCheck = require('./utils/func').postDataCheck;
global.printErrorCode = require('./utils/func').printErrorCode;
global.getErrorMsg =  require('./error/index').getErrorMsg;
global.datalize = require('datalize');
global._field = datalize.field;
datalize.set('autoValidate', true);
var { Decrypt } = require('./utils/aes');
datalize.Field.prototype.isAes = function() {
	return this.add(function(value, result, ctx) {
        var aesReg = /^[0-9A-F]{32}$/;
		if (!aesReg.test(String(value))) {
			throw new Error('用户密码不是一个AES密文串');
        }else{
            let decode = Decrypt(value);
            if(!/^.{6,40}$/.test(decode)){
                throw new Error('密码长度应该在6 至 40 之间');
            }
            if(!/^[0-9a-zA-Z-*/+.~!@#$%^&?*()]{6,40}$/.test(decode)){
                throw new Error('密码只允许包含数字,字母以及部分符号');
            }
            return decode
        }
	});
};
