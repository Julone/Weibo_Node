// import {
//   sqlQueryWithParam,
//   sqlInsertWithParam,
//   sqlDeleteWithParam,
//   sqlUpdateWithParam
// } from ;
var {sqlInsertWithParam}  = requirePath(SERVER_ROOT,'service/mysql');
exports.send_report = async function (req, res) {
    var say_id =  req.body.say_id;
    var from_user_id = req.session.user_id || '';
    var to_user_id = req.body.to_user_id;
    var report_type = req.body.report_type;
    var report_reason = req.body.report_reason;
    var report_time = Date.now();
    var sql = `INSERT into report_list(
                    feed_id,from_user_id,to_user_id,
                    report_type,report_reason,report_time)
                 values(?,?,?,?,?,?)`;
    var param = [say_id, from_user_id, to_user_id, report_type ,report_reason,report_time];
    var label = '举报微博';
    sqlInsertWithParam({sql,param,res,label});
};
