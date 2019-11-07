import {
    sqlQueryWithParamCb,
    sqlQueryWithParam
} from './../../service/mysql';
import async from 'async';
import {
    printErrorCode
} from './../../error/index'

export function selectFun(req, res, filter, cb) {
    var user_id = req.session.user_id;
    var page_num =  Number(String(req.query.page_id).trim()) || 1;
    var page_count = Number(String(req.query.page_count).trim()) || 6;
    var real_page_num = (page_num - 1) * page_count;
    var sqlCount = `select count(1) count from feed_say f left join user_info u on f.user_id = u.user_id ${filter.count_where}`;
    sqlQueryWithParam(sqlCount, []).then(r => {
        var page_total = r[0].count;
        var returnData = {
            code: 200,
            msg: filter.msg? filter.msg : '微博数据请求成功',
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
    select distinct wb.*, u.user_name,u.user_icon,
        ( select 1 from feed_say where wb.user_id = ? LIMIT 1) as auth_self_post,
        ( select follow_status from user_follow where follow_id = wb.user_id and user_id = ? ) as follow_status,
        ( select count(1) from feed_reply where say_id = wb.id and deleted = 0 ) AS reply_count,
        ( select count(1) from feed_say_like where say_id = wb.id and like_status = 1 ) AS like_count,
        ( select like_status from feed_say_like where from_user_id = ? and say_id = wb.id and like_status = 1 LIMIT 1 ) as like_click,
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
    where u.user_id is not null and  ${filter.where}
    order by ${filter.orderTop || ''} wb.say_time desc
    limit ?,?
    `;
        var param = [user_id, user_id, user_id, real_page_num, page_count];
        sqlQueryWithParamCb(sqlQuery, param, function (err, result) {
            returnData.no_more = page_total - (real_page_num + page_count) > 0 ? false : true;
            returnData.no_data = page_total <= 0;
            async.map(result, async (el, cb) => {
                let say_img = [];
                try{
                    say_img = JSON.parse(el.say_img);
                }
                catch(e){

                }
                let json = {
                    id: el.id,
                    user_id: el.user_id,
                    say_text: el.say_text,
                    say_img,
                    say_time: el.say_time,
                    say_top: el.say_top == 0 ? false : true,
                    user_name: el.user_name,
                    user_icon: el.user_icon == '' ? '' : el.user_icon,
                    auth: {
                        can_delete: el.auth_self_post == 1,
                        can_follow: el.user_id != returnData.req_user_id,
                        can_setTop: el.auth_self_post == 1
                    },
                    follow_status: el.follow_status == 1,
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
                        let o_say_img = [];
                        try{
                            o_say_img = JSON.parse(el.o_say_img);
                        }
                        catch(e){
        
                        }
                        json.repost = {
                            id: el.o_id,
                            user_id: el.o_user_id,
                            say_text: el.o_say_text,
                            say_img: o_say_img,
                            say_time: el.o_say_time,
                            user_name: el.o_user_name,
                            user_icon: el.o_user_icon == '' ? 'default_user.png' : el.user_icon,
                            delete:false
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
                returnData.data = [...result];
                cb(returnData)
            })
        })
        }
    })


}