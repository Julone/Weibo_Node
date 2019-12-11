"use strict"
import {
  sqlQueryWithParam,
  sqlInsertWithParam,
  sqlDeleteWithParam,
  sqlUpdateWithParam
} from '../../../service/mysql'
import feedQuery from '../../model/feed';

exports.get_repost_list = async function(req,res){
  var ids = req.query.ids;
  var page_num = req.query.page_id * 1 || 1; // 字符串 * 1 = int
  var page_count = req.query.page_count * 1 || 6;
  var real_page_num = (page_num - 1) * page_count;
  var req_time = req.query.req_time || Date.now();
  var sql = `select s.say_text,s.id,s.say_time,u.user_name,u.user_id,u.user_icon,
              (select count(1) from feed_say where repost_original_id = ? or repost_from_id = ? and deleted = 0) as count from feed_say s  
              left join user_info u on u.user_id = s.user_id where repost_original_id = ? or repost_from_id = ?
              and deleted = 0 or s.deleted > ${req_time} limit ?,?`;
  var param = [ids,ids,ids,ids,real_page_num,page_count];
  sqlQueryWithParam(sql,param).then(result =>{
    var page_total =  _.isEmpty(result) ? 0: result[0].count;
    var no_more = page_total - (real_page_num +page_count ) > 0 ? false: true;
    var no_data = page_total == 0 && no_more
    var data = {
        code:200,
        msg:'数据请求成功！',
        page_total: page_total,
        page_id: page_num,
        page_count: page_count,
        req_user_id: req.session.user_id,
        data: result,
        no_more: no_more,
        no_data:no_data,
        time_stamps: Date.now()
    }
    res.json(data)
  })
}

exports.repost_feed = async function (req, res) {
  var user_id = req.session.user_id;
  var say_text = req.body.repost_text || '转发微博';
  var repost_from_id = req.body.repost_from_id;
  var repost_original_id = req.body.repost_original_id;
  var repost_status = 1;
  var say_time = Date.now();
  var have =await sqlQueryWithParam('select * from feed_say where id in (?)',[repost_from_id,repost_original_id]);
  if(!have) res.json({ code: 304, msg:'转发ID与原始ID不存在' });
  var sql = `INSERT into feed_say(user_id, say_text, repost_status,repost_from_id,repost_original_id,say_time)
  values(?,?,?,?,?,?)`;
  var param = [user_id, say_text, repost_status ,repost_from_id,repost_original_id, say_time];
  return sqlInsertWithParam({sql, param,res,label:'转发微博',cbSQL(err,result){
    feedQuery(req,res,{
      where: `wb.id in (${result.insertId})`,
      count_where: `where f.id in (${result.insertId})`,
      msg:'转发微博'
    },function(data){
        res.json(data)
    })
  }})
}

