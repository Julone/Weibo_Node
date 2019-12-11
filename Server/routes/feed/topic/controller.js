"use strict"
import {
  sqlQueryWithParam,
  sqlInsertWithParam,
  sqlDeleteWithParam,
  sqlUpdateWithParam
} from '../../../service/mysql'
import feedQuery from '../../model/feed';

exports.get_topic_list = async function(req,res){
  var req_time = req.query.req_time || Date.now();
  var q = req.query.q || "";
  var sql = `select * from feed_topic where deleted = 0 and topic_name like '%${q}%' order by click_count desc`;
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
exports.topic_click = (req,res) =>{
    var id = req.query.id;
    var sql = `update feed_topic set click_count = click_count + 1 where id = ?`;
    sqlInsertWithParam({sql,param:[id],res,label:'点击话题'});
};