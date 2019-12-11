import {
    sqlQueryWithParam,
    sqlInsertWithParam,
    sqlUpdateWithParam
} from '../../../service/mysql'
import followListGet from '../_model/follow';

exports.followList = async (req,res) =>{
    return followListGet({req,res,cb(el){
        res.json(el);
    }})
}


exports.followUser = async (req, res) => {
    var user_id = req.session.user_id;
    var follow_id = req.body.follow_id;
    console.log(req.route.path);
    var follow_status = req.route.path == '/set' ? 1 : req.route.path == '/unset' ? 0 : 1;
    var add_time = Date.now();
    var sql = `select count(1) as have_record,
                EXISTS(SELECT 1 FROM user_info WHERE user_id = ?) as u_exist,
                EXISTS(SELECT 1 FROM user_info WHERE user_id = ?) as f_exist
                from user_follow where user_id = ? and follow_id = ? limit 1`;
    var param = [user_id, follow_id, user_id, follow_id];
    let label = follow_status == 1 ? '关注' : '取消关注';
    sqlQueryWithParam(sql, param).then(r => {
        if (!r[0].f_exist || !r[0].u_exist ) {
            printErrorCode(res, 'sql', 309);
        } else {
            if (r[0].have_record) {
                let sql = `update user_follow set follow_status = ?,update_time = ? where follow_id = ? and user_id = ?`;
                let param = [follow_status, add_time, follow_id, user_id];
                sqlInsertWithParam({sql, param, res, label});
            } else {
                let sql = ` insert into user_follow(follow_id,user_id,add_time,update_time,follow_status) values(?,?,?,?,?) `
                let param = [follow_id, user_id, add_time,add_time, follow_status];
                sqlInsertWithParam({sql, param, res, label});
            }
        }
    })
}