"use strict"
import {
  sqlQueryWithParam,
  sqlInsertWithParam,
  sqlDeleteWithParam,
  sqlUpdateWithParam
} from '../../service/mysql'
import feedSelect from '../model/feed';

exports.get_hot = async function (req, res) {
  var req_time = req.query.req_time || Date.now();
  var sort = req.query.sort || 'reply_count';
  feedSelect(req,res,{
    where: ` wb.deleted = 0 or wb.deleted > ${req_time}`,
    count_where: `where deleted = 0 or deleted > ${req_time} `,
    orderTop:`${sort} desc,`
  },function(data){
    res.json(data)
  })
};
exports.get_topics = async (req,res) =>{
  var q = req.query.q || "";
  var sql = `select * from feed_topic where deleted = 0 and topic_name like ?`;
  var result = await sqlQueryWithParam(sql,[`?${q}?`]);
  res.json({
    code:200,
    data:result
  })
}
exports.get_search_user = async (req,res) =>{

}
exports.get_search_feed = async (req,res) =>{
  var q = req.query.q || "";
  var req_time = req.query.req_time || Date.now();
  feedSelect(req,res,{
    where: ` wb.deleted = 0 or wb.deleted > ${req_time}`,
    count_where: `where deleted = 0 or deleted > ${req_time} `,
    orderTop:``
  },function(data){
    res.json(data)
  })
}