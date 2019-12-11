import {
    sqlQueryWithParamCb,
    sqlQueryWithParam
} from './../../service/mysql';
import async from 'async';


export default function(req, res, filter, cb) {
    var user_id = req.session.user_id;
    var page_num =  Number(String(req.query.page_id).trim()) || 1;
    var page_count = Number(String(req.query.page_count).trim()) || 6;
    var real_page_num = (page_num - 1) * page_count;
    var say_id = req.query.say_id;
    var req_time = req.query.req_time || Date.now();
    var sqlCount = `select count(1) count from feed_reply where deleted = 0 and say_id = ?`;
    sqlQueryWithParam(sqlCount, [say_id]).then(r => {
        var page_total = r[0].count;
        var returnData = {
            code: 200,
            msg: filter.msg? filter.msg : '评论数据请求成功',
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
            var sqlQuery = `
                select *,
                 (select user_name  from user_info where user_id = f.to_user_id) to_user_name,
                 (select user_id  from user_info where user_id = f.to_user_id) to_user_id,
                 (select user_icon  from user_info where user_id = f.to_user_id) to_user_icon                                
                 from (select * from feed_reply) f 
                left join (select user_name,user_icon,user_id from user_info) u
                on u.user_id = f.from_user_id
                where f.say_id = ? and f.deleted = 0 or f.deleted > ${req_time}
                order by f.reply_time desc
                LIMIT ?,?
            `;
        var param = [say_id,real_page_num,page_count];
        sqlQueryWithParamCb(sqlQuery, param, function (err, result) {
            returnData.no_more = page_total - (real_page_num + page_count) > 0 ? false : true;
            returnData.no_data = page_total <= 0;
            async.map(result, async (el, cb) => {
                let json = {
                    id: el.id,
                    user_id: el.user_id,
                    reply_text: el.reply_text,
                    reply_time: el.reply_time,
                    user_name: el.user_name,
                    user_icon: el.user_icon == '' ? '' : el.user_icon,
                    parent_id:el.parent_id,
                    origin_id:el.origin_id,
                    reply_type:el.reply_type,
                        to_user_id: el.to_user_id,
                        to_user_name: el.to_user_name,
                        to_user_icon: el.to_user_icon == '' ? '' : el.to_user_icon,

                    auth: {
                        can_delete: el.auth_self_post == 1,
                        can_follow: el.user_id != returnData.req_user_id,
                        can_setTop: el.auth_self_post == 1
                    },
                    reply: {
                        count: el.reply_count ? el.reply_count : 0
                    },
                    like: {
                        count: el.like_count?true:false,
                        isLiked: el.like_click ? true : false
                    }
                };
                cb(err, json)
            }, (err, result) => {
                if (err) printErrorCode(res, 'comment', 102)
                returnData.data = [...result];
                cb(returnData)
            })
        })
        }
    })


}