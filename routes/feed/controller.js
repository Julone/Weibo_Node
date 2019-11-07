"use strict"
import {
  sqlQueryWithParam,
  sqlInsertWithParam,
  sqlDeleteWithParam,
  sqlUpdateWithParam
} from './../../service/mysql'

exports.default = function (req, res) {
  res.json({
    code: 200,
    msg: "You are visiting the path of " + req.baseUrl
  })
}

exports.get_feed = async function (req, res) {
  var req_time = req.query.req_time || Date.now();
  require('./../model/select').selectFun(req,res,{
      where: `wb.deleted = 0 or wb.deleted > ${req_time}`,
      count_where: `where deleted = 0 or deleted > ${req_time} `,
      orderTop:``
  },function(data){
      res.json(data)
  })
}
exports.get_follow_feed = async function(req,res){
  var user_id = req.session.user_id;
  var req_time = req.query.req_time || Date.now();
  require('./../model/select').selectFun(req,res,{
      where: `wb.user_id in (select follow_id from user_follow where user_id = '${user_id}' and follow_status = 1 ) 
              and wb.deleted = 0 or wb.deleted > ${req_time}`,
      count_where: `
     where f.user_id in (select follow_id from user_follow where user_id = '${user_id}' and follow_status = 1 )
       and f.deleted = 0 or f.deleted > ${req_time}
      `,
      orderTop:``
  },function(data){
      res.json(data)
  })
}
exports.get_feed_by_id = async function(req,res){
  var ids = req.query.ids;
  var req_time = req.query.req_time || Date.now();
  require('./../model/select').selectFun(req,res,{
      where: `wb.id in (${ids}) and wb.deleted = 0 or wb.deleted > ${req_time}`,
      count_where: `where f.id in (${ids}) and deleted = 0 or deleted > ${req_time}`,
      orderTop:``
  },function(data){
      res.json(data)
  })
}

exports.send_feed = async function (req, res) {
  var user_id = req.session.user_id;
  var text = req.body.say_text;
  var img = req.body.say_img;
  var say_time = Date.now();
  if(String(text).trim() == '' && _.isEmpty(img)){
    printErrorCode(res,'feed',290);
  }
  
  var sql = `INSERT into feed_say(user_id, say_text, say_img, say_time) values(?,?,?,?)`;
  var param = [user_id, text, JSON.stringify(img), say_time];
  var label = '发送微博';
  sqlInsertWithParam({sql,param,res,label,async cbSQL(err,result,rtnData){
    require('./../model/select').selectFun(req,res,{
        where: `wb.id in (${result.insertId})`,
        count_where: `where f.id in (${result.insertId})`,
        msg:'发送微博成功'
    },function(data){
        res.json(data)
    })
  }});
}

exports.say_like = async function(req,res){
  var user_id= req.session.user_id;
  var say_id = req.body.say_id;
  var like_status = req.route.path == '/like/set' ? 1 :  req.route.path == '/like/unset' ? 0 : 1;
  var like_time = Date.now();
  var sql1 = 'select * from feed_say_like where  say_id = ? and from_user_id = ? limit 1';
  var param1 = [say_id,user_id];
  var label = like_status==1?'点赞':'取消赞';
  sqlQueryWithParam(sql1,param1).then(r=>{
    if(_.isEmpty(r) != true){
      let sql = `update feed_say_like set like_status = ?,like_time = ? where from_user_id = ? and say_id = ?`;
      let param = [like_status,like_time,user_id,say_id];
      sqlInsertWithParam({sql,param,res,label});
    }else{
      let sql = ` insert into feed_say_like(from_user_id,say_id,like_time,like_status) values(?,?,?,?) `
      let param = [user_id,say_id,like_time,like_status];
      sqlInsertWithParam({sql,param,res,label});
    }
  })
}

exports.set_top = (req, res) => {
  var {
    id
  } = req.body;
  var user_id = req.session.user_id;
  var top_status = req.route.path == '/top/set' ?  Date.now() :  req.route.path == '/top/unset' ? 0 : 0;
  var sql = `UPDATE feed_say set say_top = ? WHERE id = ? and user_id = ?`;
  var param = [top_status, id ,user_id];
  var label = top_status? '置顶':'取消置顶';
  sqlUpdateWithParam({ sql,param,res,label});
}

exports.delete_feed = function(req,res){
  var user_id = req.session.user_id;
  var say_id = req.body.say_id;
  var sql = `update feed_say set deleted = ? where id = ? and user_id = ?`;
  var param = [Date.now(), say_id , user_id];
  var label = '微博删除';
  sqlDeleteWithParam({sql,param,res,label});
}
exports.delete_comment = function(req,res){
  var user_id = req.session.user_id;
  var com_id = req.body.com_id;
  var sql = `update feed_reply set deleted = ? where id = ? and from_user_id = ?`;
  var param = [Date.now(), com_id,user_id];
  var label = '评论删除';
  sqlDeleteWithParam({sql,param,res,label});
}
