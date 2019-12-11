import {sqlDeleteWithParam} from "../../../service/mysql";

var sql = requirePath(SERVER_ROOT,'service/mysql');
var { sqlUpdateWithParam } = sql;

exports.recover_feed = function(req,res){
    var user_id = req.session.user_id;
    var say_id = req.body.say_id;
    var sql = `update feed_say set deleted = ? where id = ? and 
        (select user_admin from user_status where user_id = ?) = 1`;
    var param = [0, say_id , user_id, user_id];
    var label = '恢复微博';
    sqlUpdateWithParam({sql,param,res,label});
}
exports.recover_comment = function(req,res){
    var user_id = req.session.user_id;
    var com_id = req.body.com_id;
    var sql = `update feed_reply set deleted = ? where id = ? and (from_user_id = ? 
            or (select user_admin from user_status where user_id = ?) = 1)`;
    var param = [0, com_id,user_id,user_id];
    sqlUpdateWithParam({sql,param,res,label:'恢复评论'});
}
exports.handle_report = function(req,res){
    var user_id = req.session.user_id;
    var com_id = req.body.id_arr;
    var sql = `update report_list set report_handled = ? where id in (?) and 
                (select user_admin from user_status where user_id = ?) = 1`;
    var param = [1, com_id.join(','),user_id,user_id];
    sqlUpdateWithParam({sql,param,res,label:'举报处理'});
}