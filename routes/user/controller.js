"use strict";
import {
    sqlQueryWithParam,
    sqlInsertWithParam,
    sqlUpdateWithParam
} from './../../service/mysql'
import feedSelect from './../model/feed'

exports.getUserFeedById = (req,res) =>{
    var user_id = req.params.id;
    var req_time = req.query.req_time || Date.now();
    feedSelect(req,res,{
        where: `wb.user_id = '${user_id}' and wb.deleted = 0 or wb.deleted > ${req_time}`,
        count_where: `where f.user_id = '${user_id}' and deleted = 0 or deleted > ${req_time}`,
        orderTop:`wb.say_top desc,`
    },function(data){
        res.json(data)
    })
}

exports.getInfo = (req, res) => {
    var user_id = req.query.user_id || req.session.user_id;
    var sql = `select id,user_id,user_name,user_email,user_bg,user_icon,user_sex
                ,user_birth,user_introduce,user_reg_time,user_locate,
                (select count(1) from user_follow where user_id = ? and follow_status =1) as follow_count,
                (select count(1) from user_follow where follow_id = ? and follow_status =1) as fans_count,
                (select count(1) from feed_say where user_id = ? and deleted = 0) as feed_count
                from user_info where user_id = ?`;
    var param = [user_id,user_id,user_id,user_id];
    sqlQueryWithParam(sql, param).then(r => {
        if(_.isEmpty(r)) throw new Error(100);
        res.json({
            code: 200,
            msg:'获取用户信息成功',
            data: r
        })
    }).catch(err => {
        console.log(err);
        if(err) printErrorCode(res, 'user', 100)
    })
}
exports.setPassword = async (req,res) =>{
    var old_pass = req.body.old_pass;
    var new_pass = req.body.new_pass;
    var user_id = req.session.user_id;
    var sql = `select user_pass from user_info where user_id = ?`;
    var rs = await sqlQueryWithParam(sql,[user_id],true);
    if(rs.user_pass === old_pass){
        var sql = `update user_info set user_pass = ? where user_id = ?`;
        var param = [new_pass,user_id];
        return sqlUpdateWithParam({sql,param,label:'更改密码'});
    }else{
        printErrorCode(res, 'user', 380)
    }
};
exports.changeUserHead = (req,res)=>{
    var imgData= req.body.data;
    var user_id = req.session.user_id;
    var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = Buffer.from(base64Data, 'base64');
    var distFileName = `${user_id }_${Date.now()}.png`
    require('fs').writeFile('./uploads/user_icon/' + distFileName, dataBuffer, function(err) {
        if(err){
          res.json({code:344,msg:'头像上传失败，请稍后重试'});
        }else{
            var sql = `UPDATE user_info set user_icon=? WHERE user_id = ?`;
            var param = [distFileName,user_id]
            sqlUpdateWithParam({sql,param,res,okMsg:'头像保存成功',okData:{path:distFileName}})
        }
    });
    
}

exports.setInfo = (req, res) => {
    var {
        user_name,
        user_sex,
        user_birth,
        user_introduce,
        user_locate
    } = req.body;
    var user_id = req.session.user_id;
    var sql = `UPDATE user_info set user_name = ?,user_sex=?,user_birth=?,user_introduce = ?,
                user_locate = ? WHERE user_id = ?`;
    var param = [user_name,  user_sex, user_birth, user_introduce,JSON.stringify(user_locate),user_id];
    sqlUpdateWithParam({sql,param,res,label:'更新资料'})
}