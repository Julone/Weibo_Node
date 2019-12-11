"use strict"
import {
  sqlQueryWithParam,
  sqlInsertWithParam,
  sqlDeleteWithParam,
  sqlUpdateWithParam
} from '../../../service/mysql'
import feedSelect from '../../model/feed';

exports.get_follow_feed = async function (req,res){
  var user_id = req.session.user_id;
  var req_time = req.query.req_time || Date.now();
  feedSelect(req,res,{
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