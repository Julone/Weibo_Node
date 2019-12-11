// import email from '../../service/email'
// import redis from '../../service/redis'
// import sms from '../../service/sms'
// import Token from '../../service/token'
// import { dateFormat, md5, randomCode, postDataCheck, isNullVal, printErrorCode } from '../../utils/base'
// import {Decrypt, Encrypt} from '../../utils/aes';
import {sqlQueryWithParam} from "../../../service/mysql";

async function to_json({req,res,sqlCount,sql,handle_data = null}){
    var page_num =  Number(String(req.query.page_id).trim()) || 1;//是否分页的当前ID
    var page_count = Number(String(req.query.page_count).trim()) || 10;//分页数量
    var real_page_num = (page_num - 1) * page_count;//实际在数据库中的分页ID
    var count = await sqlQueryWithParam(sqlCount,[],true);
    var json = {
        code: 200,
        msg: '数据请求成功',
        page_total: count.total,
        page_id: page_num,
        page_count: page_count,
        data: [],
        no_more: true,
        no_data:true,
        time_stamps: Date.now()
    };
    if(count.total == 0 ){
        return res.json(json);
    }else{
        var data = await sqlQueryWithParam(sql,[real_page_num,page_count]);
        json.data = data;
        handle_data && (json.data = handle_data(data));
        json.no_more = json.page_total - (real_page_num + page_count) <= 0;
        json.no_data = json.page_total <= 0;
        return res.json(json);
    }
}


exports.weibo_get = async (req, res) => {
    var sqlCount = `select count(1) total from feed_say f left join 
         user_info u on f.user_id = u.user_id`;
    var sql = ` select s.*,i.user_id,i.user_icon,i.user_name from feed_say s
                    left join user_info i on s.user_id = i.user_id
                    order by id desc
                    limit ?,?
                   `;
    return to_json({sqlCount,sql,req,res,handle_data:function weibo_format(data){
            return data.map(el=>{
                el.say_img = _.parseJSON(el.say_img);
                return _.omit(el,'say_text','repost_from_id','repost_original_id');
            })
        }})
};
exports.report_get = async (req, res) => {
    var sql = `select r.*,
s.id say_id,s.say_origin_text,s.say_img,s.say_top,s.repost_status,s.deleted say_deleted,s.say_time,
i.user_name from_user_name,i.user_icon from_user_icon,
i2.user_name to_user_name,i2.user_icon to_user_icon
from report_list r
left join feed_say s on r.feed_id = s.id 
left join user_info i on r.from_user_id = i.user_id
left join user_info i2 on r.to_user_id = i2.user_id
where report_handled = 0
order by r.id desc
limit ?,?
`;
    var sqlCount = `select count(1) total from report_list where report_handled = 0`;


    return to_json({sqlCount,sql,req,res,handle_data:function weibo_format(data){
            return data.map(el=>{
                el.say_img = _.parseJSON(el.say_img);
                return _.omit(el,'say_text','repost_from_id','repost_original_id');
            })
        }})
};
exports.reply_get = (req,res) => {
    var sqlCount = `select count(1) total from feed_reply f`;
    var sql = ` select s.*,i.user_id,i.user_icon,i.user_name,
                    (select user_name from user_info where user_id = s.to_user_id) to_user_name,
                    (select user_icon from user_info where user_id = s.to_user_id) to_user_icon
                    from feed_reply s
                    left join user_info i on s.from_user_id = i.user_id
                    order by reply_time desc
                    limit ?,?
                   `;
    return to_json({sqlCount,sql,req,res})
};