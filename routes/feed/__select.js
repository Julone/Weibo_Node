import {
    sqlQueryWithParamCb
} from './../../service/mysql';
import async from 'async';
import {
    printErrorCode
} from './../../error/index'

export function selectFun(req, res, cb ) {
    var user_id = req.session.user_id || '';
    var page_num = req.params.page_num * 1 || 1; // 字符串 * 1 = int
    var page_count = req.query.page_count * 1 || 6;
    var real_page_num = (page_num - 1) * page_count;
    var sql = `   
    select wb.*, u.user_name,u.user_icon,
        ( select count(1) from feed_say where deleted = 0) as count,
        ( select 1 from feed_say where wb.user_id = ? LIMIT 1) as auth_self_post,
        ( select count(1) from feed_reply where say_id = wb.id and deleted = 0 ) AS reply_count,
        ( select count(1) from feed_say_like where say_id = wb.id and like_status = 1 ) AS like_count,
        ( select like_status from feed_say_like where from_user_id = ? and say_id = wb.id LIMIT 1 ) as like_click,
        ( select count(1) from feed_say where repost_original_id = wb.id ) as repost_original_count,
        ( select count(1) from feed_say where repost_from_id = wb.id ) as repost_repost_count
    
    from(
        select a.*,b.*, 
              (select user_name from user_info where b.o_user_id = user_info.user_id)as o_user_name,
              (select user_icon from user_info where b.o_user_id = user_info.user_id)as o_user_icon from (
              select  * from feed_say
        ) a 
        left join 
            (select o.id o_id,o.user_id o_user_id,o.say_text o_say_text,o.say_img o_say_img,o.say_time o_say_time,o.deleted o_deleted
                from feed_say o) b 
        on a.repost_original_id = b.o_id
    ) wb
    left join 
    (select * from user_info) u
    on u.user_id = wb.user_id
    order by wb.say_time desc
    limit ?,?
    `;
    var param = [user_id, user_id , real_page_num, page_count];
    sqlQueryWithParamCb(sql, param, function (err, result) {
        var data = {
            count: result[0].count,
            cur_page: page_num,
            cur_count: page_count,
            req_user_id: user_id
        }
        async.map(result, (el, cb) => {
            var json = {
                id: el.id,
                user_id: el.user_id,
                say_text: el.say_text,
                say_img: el.say_img,
                say_time: el.say_time,
                say_top: el.top == 0 ? false : true,
                user_name: el.user_name,
                user_icon: el.user_icon == '' ? 'default_user.png' : el.user_icon,
                auth: {
                    self_send: el.auth_self_post ? true : false,
                },
                repost_count: el.repost_status == 0 ? el.repost_original_count : el.repost_repost_count,
                reply: {
                    count: el.reply_count ? el.reply_count : 0
                },
                like: {
                    count: el.like_count,
                    isLiked: el.like_click ? true : false
                }
            };
            if (el.repost_status == 1 && el.repost_from_id && el.repost_original_id) {
                if (el.o_deleted == 0) {
                    json.repost = {
                        id: el.o_id,
                        user_id: el.o_user_id,
                        say_text: el.o_say_text,
                        say_img: el.o_say_img,
                        say_time: el.o_say_time,
                        user_name: el.o_user_name,
                        user_icon: el.o_user_icon == '' ? 'default_user.png' : el.user_icon,
                    }
                } else {
                    json.repost = {
                        delete: true,
                        delete_time: el.o_deleted
                    }
                }
            }
            cb(err, json)
        }, (err, result) => {
            if (err) printErrorCode(res, 'feed', 102)
            data.data = [...result];
            cb(data)
        })

    })
}