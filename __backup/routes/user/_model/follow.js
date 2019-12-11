import {
    sqlQueryWithParamCb,
    sqlQueryWithParam
} from './../../../service/mysql';
import async from 'async';

export default function({req, res, filter = {}, cb}) {
    var user_id = req.query.user_id || req.session.user_id;
    var page_num =  Number(String(req.query.page_id).trim()) || 1;
    var page_count = Number(String(req.query.page_count).trim()) || 6;
    var real_page_num = (page_num - 1) * page_count;
    // select * from user_info where user_id in (
    var sqlCount = `
                select b.*,a.*,
                (select user_admin from user_status where user_id = a.user_id) user_admin
                from user_follow a
                left join user_info b
                 on a.follow_id = b.user_id
                  where a.user_id = ? and a.follow_status = 1
                  order by update_time desc,add_time
                    `;
    sqlQueryWithParam(sqlCount, [user_id]).then(r => {
        var page_total = r.length;
        var returnData = {
            code: 200,
            msg: filter.msg? filter.msg : '获取关注人成功',
            page_total: page_total,
            page_id: page_num,
            page_count: page_count,
            req_user_id: user_id,
            data: [],
            no_more: true,
            no_data:true,
            time_stamps: Date.now()
        }
        if(page_total == 0) {
            res.json(returnData);
        }else{
        var sqlQuery = sqlCount + ` limit ?,?`;
        var param = [user_id, real_page_num, page_count];
        sqlQueryWithParamCb(sqlQuery, param, function (err, result) {
            returnData.no_more = page_total - (real_page_num + page_count) > 0 ? false : true;
            returnData.no_data = page_total <= 0;
            async.map(result, async (el, cb) => {
                cb(err, _.omit(el,'user_pass'))
            }, (err, result) => {
                if (err) printErrorCode(res, 'follow', 102)
                returnData.data = [...result];
                cb(returnData)
            })
        })
        }
    })


}