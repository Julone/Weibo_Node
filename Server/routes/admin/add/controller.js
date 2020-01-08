// import email from '../../service/email'
// import redis from '../../service/redis'
// import sms from '../../service/sms'
// import Token from '../../service/token'
// import { dateFormat, md5, randomCode, postDataCheck, isNullVal, printErrorCode } from '../../utils/base'
// import {Decrypt, Encrypt} from '../../utils/aes';
import {sqlQueryWithParam,sqlInsertWithParam} from "../../../service/mysql";

exports.topic_add = (req,res) => {
    var {topic_name,topic_type} = req.body;
    var sql = `insert into feed_topic set topic_name = ?,topic_type=?,create_time=?,
               update_time=?,deleted = 0`;
    var param = [topic_name,topic_type,Date.now(),Date.now()];
    return sqlInsertWithParam({
        sql,res,req,param,label:'话题添加'
    });
};