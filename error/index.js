let errList = {
    login:{
        301:'请求不合法!',
    },
    upload:{
        301:'请求不合法',
        401: "文件上传失败!",
        402: "创建webp格式失败!",
    },
    verify:{
        103: '缺少必要参数',
        104: '邮箱格式不正确',
        105: '手机号码格式不正确',
        106: '验证码输入错误',
        //注册
        503:'注册失败,请稍候重试',
        506:'该邮箱已被注册，请更换新的邮箱',
        520:'请先向注册邮箱发送验证码',
        //登录
        405:'该登录账号不存在，请先注册!',
        309:'账号或者密码错误！',
        312:'该帐号已被封锁，请联系管理员',
        //邮箱
        550:'邮箱地址有误，找不到该邮箱地址',
        530:'邮箱验证码发送失败，请稍候重试!',
        531:'邮箱验证码已过期，请重新请求验证!',
        532:'邮箱验证码不正确，请查看邮箱!'
    },
    user:{
        100:'获取用户信息失败!',
        120:'更新用户信息失败!'
    },
    feed:{
        102:'获取微博列表错误!'
    },
    sql:{
        302:'记录删除失败！',
        304:'插入记录失败！',
        309:'该用户不存在！',
        310:'更新数据失败'

    }
}


exports.printErrorCode = function(res,...args){
    let msg =args.reduce((t,el)=>{
        t = t[el];
        return t;
    },errList)
    res.json({
        code:args[1],
        msg:msg,
        timeStamp:Date.now()
    });
};
exports.getErrorMsg = getErrorMsg;

function getErrorMsg (...args){
    return args.reduce((t,el)=>{
        t = t[el];
        return t;
    },errList)
}