var { Decrypt } = require('./aes');
var { reg_password,reg_email,reg_phone }  = require('./reg-exp');
var _ = require('underscore');
export default {
    password:function(value) {
        if(!value){
			throw new Error('请输入用户密码');
        }
		if (!reg_password.test(String(value))) {
			throw new Error('用户密码不是一个密文串');
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
    },
    email:function(value) {
        if(_.isEmpty(value)){
			throw new Error('请输入邮箱账号');
        }
		if (!reg_email.test(String(value))) {
			throw new Error('这不是一个邮箱');
        }else{
            return value
        }
    },
    required:function(value){
        var key = this.label || this.name;
		if (_.isEmpty(value)) {
			throw new Error(key + '不允许为空');
        }else{
            return value
        }
    },
    phone:function(value){
        if(_.isEmpty(value)){
			throw new Error('请输入手机号码');
        }
		if (!reg_phone.test(String(value))) {
			throw new Error('手机号格式不正确');
        }else{
            return value
        }
    },
    length:function(min,max,value){
        var key = this.label || this.name;
        if( String(value).length < min ){
            throw new Error(key + '的长度小于' + min +"个字符");
        }
        if( String(value).length > max ){
            throw new Error(key + '的长度大于' + max +"个字符");
        }
        return value;
    },
    nickName:function(min,max,value){
        var key = this.label || this.name;
        if( String(value).length < min ){
            throw new Error(key + '的长度小于' + min +"个字符");
        }
        if( String(value).length > max ){
            throw new Error(key + '的长度大于' + max +"个字符");
        }
        return value;
    }


}