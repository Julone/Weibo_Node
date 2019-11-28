"use strict"
import {
  sqlQueryWithParam,
  sqlInsertWithParam,
  sqlDeleteWithParam,
  sqlUpdateWithParam
} from './../../service/mysql'
import feedSelect from './../model/feed';

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
exports.get_user_name = async function (req,res) {
  var user_name = req.query.user_name;
  var sql = `select * from user_info where user_name like '%${user_name}%'`;
  var result = await sqlQueryWithParam(sql,[])
                .then(r1=> r1.map(el => _.pick(el,'user_name','user_id','user_introduce','user_icon')));
  res.json({
    code:200,
    data:result
  })
};

exports.get_topics = async (req,res) =>{
  var sql = `select * from feed_topic where deleted = 0 `;
  var result = await sqlQueryWithParam(sql,[]);
  res.json({
    code:200,
    data:result
  })
}
