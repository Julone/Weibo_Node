"use strict"
import {
  sqlQueryWithParam,
  sqlInsertWithParam,
  sqlDeleteWithParam
} from '../../../service/mysql'
import get_favor from '../../model/feed';

exports.get_favor = async function(req,res) {
  var user_ids = req.session.user_id;
  return get_favor(req,res,{
      where: `wb.id in (
        select say_id from feed_favor where from_user_id = '${user_ids}' and favor_status = 1 
        order by favor_time desc
      )`,
      orderBy:'ffff.favor_time desc',
      leftJoin:` left join feed_favor ffff
                    on wb.id = ffff.say_id`,
      count_where:`where f.id in (
        select say_id from feed_favor where from_user_id = '${user_ids}' and favor_status = 1     
      )`,
  },function(data){
    res.json(data)
  });
}
exports.add_favor = function (req,res) {
    var user_id= req.session.user_id;
    var say_id = req.body.say_id;
    var like_status = req.route.path == '/set' ? 1 :  req.route.path == '/unset' ? 0 : 1;
    var favor_time = Date.now();
    var sql1 = 'select * from feed_favor where  say_id = ? and from_user_id = ? limit 1';
    var param1 = [say_id,user_id];
    var label = like_status==1?'收藏':'取消收藏';
    sqlQueryWithParam(sql1,param1).then(r=>{
      if(_.isEmpty(r) != true){
        let sql = `update feed_favor set favor_status = ?,favor_time = ? where from_user_id = ? and say_id = ?`;
        let param = [like_status,favor_time,user_id,say_id];
        sqlInsertWithParam({sql,param,res,label});
      }else{
        let sql = ` insert into feed_favor(from_user_id,say_id,favor_time,favor_status) values(?,?,?,?) `
        let param = [user_id,say_id,favor_time,like_status];
        sqlInsertWithParam({sql,param,res,label});
      }
    })

}