"use strict"
import {
    sqlQueryWithParam,
    sqlInsertWithParam,
    sqlUpdateWithParam
} from './../../service/mysql'

exports.getUserFeedById = (req,res) =>{
    var user_id = req.params.id;
    var req_time = req.query.req_time
    require('./../model/select').selectFun(req,res,{
        where: `wb.user_id = '${user_id}' and wb.deleted = 0 or wb.deleted > ${req_time}`,
        count_where: `where user_id = '${user_id}' and deleted = 0 or deleted > ${req_time}`,
        orderTop:`wb.say_top desc,`
    },function(data){
        res.json(data)
    })
}

exports.getInfo = (req, res) => {
    var user_id = req.query.user_id || req.session.user_id;
    var sql = `select user_id,user_name,user_email,user_phone,user_icon,user_sex
                ,user_birth,user_introduce,user_reg_time,
                (select count(1) from user_follow where user_id = ?) follow_count,
                (select count(1) from user_follow where follow_id = ?) fans_count
                from user_info where user_id = ?`
    var param = [user_id,user_id,user_id];
    sqlQueryWithParam(sql, param).then(r => {
        if(_.isEmpty(r)) throw new Error(100)
        res.json({
            code: 200,
            msg:'获取用户信息成功',
            data: r
        })
    }).catch(err => {
        if(err) printErrorCode(res, 'user', 100)
    })
}
exports.changeUserHead = (req,res)=>{
    var imgData= req.body.data;
    var user_id = req.session.user_id;
    var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = Buffer.from(base64Data, 'base64');
    var distFileName = `${user_id }_${Date.now()}.png`
    require('fs').writeFile('./uploads/user_icon/' + distFileName, dataBuffer, function(err) {
        if(err){
          res.json({code:344,msg:'头像上传失败，请稍后重试！'});
        }else{
            var sql = `UPDATE user_info set user_icon=? WHERE user_id = ?`;
            var param = [distFileName,user_id]
            sqlUpdateWithParam(sql,param,res,{okMsg:'头像保存成功',okData:{path:distFileName}})
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
    var sql = `UPDATE user_info set user_name = ?,user_sex=?,user_birth=?,user_introduce = ? WHERE user_id = ?`;
    var param = [user_name,  user_sex, user_birth, user_introduce,user_id];
    sqlUpdateWithParam(sql,param,res,{okMsg:'更新个人资料成功'})
}



exports.followUser = async (req, res) => {
    var user_id = req.session.user_id;
    var follow_id = req.body.follow_id;
    var follow_status = req.route.path == '/follow/set' ? 1 : req.route.path == '/follow/unset' ? 0 : 1;
    var add_time = Date.now();
    var sql = `select count(1) as have_record,
                EXISTS(SELECT 1 FROM user_info WHERE user_id = ?) as u_exist,
                EXISTS(SELECT 1 FROM user_info WHERE user_id = ?) as f_exist
                from user_follow where user_id = ? and follow_id = ? limit 1`;
    var param = [user_id, follow_id, user_id, follow_id];
    sqlQueryWithParam(sql, param).then(r => {
        if (!r[0].f_exist || !r[0].u_exist ) {
            printErrorCode(res, 'sql', 309);
        } else {
            if (r[0].have_record) {
                let sql = `update user_follow set follow_status = ?,update_time = ? where follow_id = ? and user_id = ?`;
                let param = [follow_status, add_time, follow_id, user_id];
                sqlInsertWithParam(sql, param, res, {
                    okMsg: follow_status == 1 ? '关注成功！' : '取消关注成功！'
                });
            } else {
                let sql = ` insert into user_follow(follow_id,user_id,add_time,update_time,follow_status) values(?,?,?,?,?) `
                let param = [follow_id, user_id, add_time,add_time, follow_status];
                sqlInsertWithParam(sql, param, res, {
                    okMsg: follow_status == 1 ? '关注成功！' : '取消关注成功！'
                });
            }
        }

    })
}