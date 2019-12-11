"use strict"
import email from '../../service/email'
import redis from '../../service/redis'
import sms from '../../service/sms'
import Token from '../../service/token'
import { dateFormat, md5, randomCode, postDataCheck, isNullVal, printErrorCode } from '../../utils/base'
import { sqlQueryWithParam, sqlQuery } from '../../service/mysql'
import {Decrypt, Encrypt} from '../../utils/aes'

export function  getMenu(req,res) {
  var user_id = req.session.user_id || '';
  var sql = `
             select * from user_menu where role = 'visitor' 
             union all
             select * from user_menu where role = 'user' and (
                select 1 from user_info where user_id = ?
             ) = 1
             union all
             select * from user_menu where role ='admin' and 
             (select user_admin from user_status where user_id = ? and deleted = 0 ) = 1
            `;
  sqlQueryWithParam(sql,[user_id,user_id]).then( r=>{
      let data =  r.map( el=> _.omit(el,'Id') ) ;
      res.json({
        code: 200,
        msg: '菜单获取成功',
        data: data,
        login_status: !! user_id
      })
  }).catch(e=>{
    console.log(e);
    printErrorCode(res,'menu', 120 )
  })
}