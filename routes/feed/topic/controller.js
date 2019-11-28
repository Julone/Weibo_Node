"use strict"
import {
  sqlQueryWithParam,
  sqlInsertWithParam,
  sqlDeleteWithParam,
  sqlUpdateWithParam
} from './../../../service/mysql'
import feedQuery from './../../model/feed';

exports.get_topic_list = async function(req,res){
  var req_time = req.query.req_time || Date.now();
  var sql = `select * from feed_topic where deleted = 0`;
  var param = [];
  sqlQueryWithParam(sql,param).then(async result =>{
    var filtered = await result.map(el=> _.omit(el,'deleted') );
    var data = {
        code:200,
        msg:'话题请求成功！',
        req_user_id: req.session.user_id,
        data: filtered,
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

