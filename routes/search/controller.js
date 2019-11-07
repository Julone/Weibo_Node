"use strict"
import {
    sqlQueryWithParam,
    sqlInsertWithParam,
    sqlUpdateWithParam
} from './../../service/mysql'

exports.searchByUser = (req, res) => {
    var q = req.query.q;
    var page_num =  Number(String(req.query.page_id).trim()) || 1;
    var page_count = Number(String(req.query.page_count).trim()) || 6;
    var real_page_num = (page_num - 1) * page_count;

    var sql = `select user_id,user_name,user_icon,user_introduce,
    (select count(1) from user_follow f where f.follow_id = i.user_id and f.follow_status = 1) as fan_count
    from user_info i
    where i.user_name like ?`;
    var param = ['%' + q +'%'];
    sqlQueryWithParam(sql, param).then(r => {
        res.json({
            code: 200,
            msg:'包含用户名为 ' + q + ' 的用户有'+r.length +'个',
            page_count:r.length,
            page_id,
            data: r
        })
    }).catch(err => {
        if(err) printErrorCode(res, 'user', 100)
    })
}
