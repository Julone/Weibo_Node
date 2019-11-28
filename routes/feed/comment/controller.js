"use strict"
import {
  sqlQueryWithParam,
  sqlInsertWithParam,
  sqlDeleteWithParam
} from './../../../service/mysql'
import getcom from './../../model/comment';

exports.send_comment = async function(req,res) {
  var user_id = req.session.user_id;
  // {say_id,to_user_id,reply_text}
  var say_id = req.body.say_id;
  var to_user_id = req.body.to_user_id;
  var reply_text = req.body.reply_text;
  var origin_id = req.body.origin_id || null;
  var parent_id = req.body.parent_id || null;
  var reply_type = req.body.type;
  var reply_time = Date.now();
  var from_user_id = user_id;
  var sql = `
              insert ignore into feed_reply(say_id,reply_type,to_user_id,from_user_id,reply_text,
              reply_time,origin_id,parent_id)
              values(?,?,?,?,?,?,?,?)
            `;
  var param = [say_id, reply_type,to_user_id,from_user_id,reply_text,reply_time,origin_id,parent_id];
  sqlInsertWithParam({sql,param,res,label:'评论',cbSQL:function(err,result,succss){
    var sql = `select r.*,(select user_name  from user_info where user_id = r.to_user_id) to_user_name,
                 (select user_id  from user_info where user_id = r.to_user_id) to_user_id,
                 (select user_icon  from user_info where user_id = r.to_user_id) to_user_icon,i.user_icon,i.user_name,i.user_id from feed_reply r left join 
            user_info i on r.from_user_id = i.user_id where r.id = ?`;
    var param = [result.insertId];
    sqlQueryWithParam(sql,param).then(r=>{
      succss.data = r;
      res.json(succss)
    })
  }
  });
}
exports.get_comment = async function(req,res) {
  return getcom(req,res,{
  },function(data){
    res.json(data)
  });
}

exports.delete_comment = function(req,res){
  var user_id = req.session.user_id;
  var com_id = req.body.com_id;
  var sql = `update feed_reply set deleted = ? where id = ? and from_user_id = ?`;
  var param = [Date.now(), com_id,user_id]
  sqlDeleteWithParam({sql,param,res,label:'评论删除'});
}
