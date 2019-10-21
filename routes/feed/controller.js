"use strict"
import {
  postDataCheck
} from './../../utils/func'
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
      count_where: `where deleted = 0 or deleted > ${req_time}`,
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
      count_where: `where deleted = 0 or deleted > ${req_time}`,
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
      count_where: `where deleted = 0 or deleted > ${req_time}`,
      orderTop:``
  },function(data){
      res.json(data)
  })
}

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

exports.send_feed = async function (req, res) {
  var user_id = req.session.user_id;
  var text = req.body.say_text;
  var img = req.body.say_img;
  var say_time = Date.now();
  var sql = `INSERT into feed_say(user_id, say_text, say_img, say_time) values(?,?,?,?)`;
  var param = [user_id, text, JSON.stringify(img), say_time];
  sqlQueryWithParam(sql, param).then(result => {
    res.json({
      code: 200,
      data: result
    })
  })
}
exports.repost_feed = async function (req, res) {
  var user_id = req.session.user_id;
  var say_text = req.body.repost_text;
  var repost_from_id = req.body.repost_from_id;
  var repost_original_id = req.body.repost_original_id;
  var repost_status = 1;
  var say_time = Date.now();
  var sql = `INSERT into feed_say(user_id, say_text, repost_status,repost_from_id,repost_original_id,say_time)
             values(?,?,?,?,?,?)`;
  var param = [user_id, say_text, repost_status ,repost_from_id,repost_original_id, say_time];
  sqlQueryWithParam(sql, param).then(result => {
    res.json({
      code: 200,
      data: result
    })
  })
}

exports.send_comment = async function(req,res) {
  var user_id = req.session.user_id;
  // {say_id,to_user_id,reply_text}
  var say_id = req.body.say_id;
  var to_user_id = req.body.to_user_id;
  var reply_text = req.body.reply_text;
  var reply_time = Date.now();
  var reply_type = 0;
  var from_user_id = user_id;
  var sql = `
              insert ignore into feed_reply(say_id,reply_type,to_user_id,from_user_id,reply_text,reply_time)
              values(?,?,?,?,?,?)
            `;
  var param = [say_id, reply_type,to_user_id,from_user_id,reply_text,reply_time];
  sqlInsertWithParam(sql,param,res,function(el){
    var sql = 'select * from feed_reply where id = ?';
    var param = [el];
    sqlQueryWithParam(sql,param).then(r=>{
      res.json({
        code:200,
        data:r,
        msg:'评论发送成功'
      })
    })
  });
}
exports.get_comment = async function(req,res) {
  var user_id = req.session.user_id;
  var say_id = req.query.say_id;
  var page_id = req.query.page_id * 1 || 1; // 字符串 * 1 = int
  var page_count = req.query.page_count * 1 || 6;
  var real_page_num = (page_id - 1) * page_count;
  var sql = `
  select *,( select count(1) from feed_reply where deleted = 0 and say_id = ?) as count 
  from (select * from feed_reply) f left join (select user_name,user_icon,user_id from user_info) u
  on u.user_id = f.from_user_id 
  where f.say_id = ?
  limit ?,?
        `;
  var param = [say_id,say_id,real_page_num,page_count];
  sqlQueryWithParam(sql,param).then(r=>{
    var total =  r[0]? r[0].count : 0;
    var data = {
      total:total,
      cur_page_id: page_id,
      cur_page_count: page_count,
      req_user_id: user_id,
      
      data:r
    }
    res.json({code:200,data:data})
  })
}

exports.say_like = async function(req,res){
  var user_id= req.session.user_id;
  var say_id = req.body.say_id;
  var like_status = req.route.path == '/like/set' ? 1 :  req.route.path == '/like/unset' ? 0 : 1;
  var like_time = Date.now();
  postDataCheck(res, { say_id, user_id });
  var sql1 = 'select * from feed_say_like where  say_id = ? and from_user_id = ? limit 1';
  var param1 = [say_id,user_id];
  sqlQueryWithParam(sql1,param1).then(r=>{
    if(_.isEmpty(r) != true){
      let sql = `update feed_say_like set like_status = ?,like_time = ? where from_user_id = ? and say_id = ?`;
      let param = [like_status,like_time,user_id,say_id];
      sqlInsertWithParam(sql,param,res,{okMsg:like_status==1?'点赞成功！':'取消赞成功！'});
    }else{
      let sql = ` insert into feed_say_like(from_user_id,say_id,like_time,like_status) values(?,?,?,?) `
      let param = [user_id,say_id,like_time,like_status];
      sqlInsertWithParam(sql,param,res,{okMsg:like_status==1?'点赞成功！':'取消赞成功！'});
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
  sqlUpdateWithParam(sql,param,res,{
    okMsg:top_status? '置顶成功':'取消置顶成功',
    errMsg:top_status? '置顶失败':'取消置顶失败'
  })
}

exports.delete_feed = function(req,res){
  var user_id = req.session.user_id;
  var say_id = req.body.say_id;
  var sql = `update feed_say set deleted = ? where id = ? and user_id = ?`;
  var param = [Date.now(), say_id , user_id]
  sqlDeleteWithParam(sql,param,res);
}
exports.delete_comment = function(req,res){
  var user_id = req.session.user_id;
  var com_id = req.body.com_id;
  var sql = `update feed_reply set deleted = ? where id = ? and from_user_id = ?`;
  var param = [Date.now(), com_id,user_id]
  sqlDeleteWithParam(sql,param,res);
}
