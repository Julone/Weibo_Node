import mysqlClient from "mysql";
import {
  printErrorCode
} from '../utils/error'

var connection = mysqlClient.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'phantom',
  useConnectionPooling: true,
  // debug:true,
  port: 3306
});
connection.connect(function (err) {
  if (err) {
    console.error('mysql连接失败: ' + err);
    return;
  }
  console.log('mysql连接成功 id ' + connection.threadId);
});

export const sqlQuery = (sql,param = []) => {
  return new Promise((resolve, reject) => {
    connection.query(mysqlClient.format(sql,param), (err, result) => {
      console.log('SQL语句：' + mysqlClient.format(sql, param));
      console.log("mysql错误：" + err);
      if (err) reject(err);
      else resolve(result);
    })
  }).then(r=>r).catch(e=>{
    throw new Error("数据库错误")
  })
}

export const sqlQueryWithParam = (sql, param,getOne=false) => {
  return new Promise((resolve, reject) => {
    connection.query(mysqlClient.format(sql, param), (err, result) => {
      console.log('SQL语句：' + mysqlClient.format(sql, param));
      console.log("mysql错误：" + err);
      if (err) reject(err);
      else {
        let output = JSON.parse(JSON.stringify(result));
        resolve(getOne?output[0]:output);
      }
    })
  })
}
export const sqlQueryWithParamCb = (sql, param, cb) => {
  return connection.query(mysqlClient.format(sql, param), (err, result) => {
    console.log('SQL语句：' + mysqlClient.format(sql, param));
    console.log("mysql错误：" + err);
    cb(err, result);
  })
}
export const sqlInsertWithParam = ({
  sql = null,
  param = null,
  res = null,
  cbSQL = null,
  label = '',
  okMsg = (label != '' ? label :'插入') +'成功',
  errMsg = (label != '' ? label :'插入') + '失败',
  errData = {},
  okData = {}
}) => {
  console.log('SQL语句：' + mysqlClient.format(sql, param));
  connection.query(mysqlClient.format(sql, param), (err, result) => {
    console.log("mysql错误：" + err);
    if (err) printErrorCode(res, 'sql', 304)
    else {
      if (result.affectedRows > 0) {
        var rtnData = {
          code: 200,
          msg: okMsg,
          data: okData,
          timestamps: Date.now()
        }
        if (cbSQL) {
          cbSQL( err,result,rtnData);
        } else {
          res.json(rtnData);
        }
      } else {
        res.json({
          code: 332,
          msg: errMsg,
          data: errData,
          timestamps: Date.now()
        });
      }
    }
  })
}
export const sqlUpdateWithParam = ({
  sql = null,
  param = null,
  res = null,
  cbSQL = null,
  label = '',
  okMsg = (label != '' ? label :'更新') +'成功',
  errMsg = (label != '' ? label :'更新') + '失败',
  errData = {},
  okData = {}
}) => {
  connection.query(mysqlClient.format(sql, param), (err, result) => {
    console.log('SQL语句：' + mysqlClient.format(sql, param));
    console.log("mysql错误：" + err);
    if (err) printErrorCode(res, 'sql', 310)
    else {
      if (result.changedRows > 0) {
        var rtnData = {
          code: 200,
          msg: okMsg,
          data: okData,
          timestamps: Date.now()
        }
        if (cbSQL) {
          cbSQL(err, result, rtnData);
        } else {
          res.json(rtnData);
        }
      } else {
        res.json({
          code: 332,
          msg: errMsg,
          data: errData,
          timestamps: Date.now()
        });
      }
    }
  })
}

export const sqlDeleteWithParam = ({
  sql = null,
  param = null,
  res = null,
  cbSQL = null,
  label = '',
  okMsg = (label != '' ? label :'删除') +'成功',
  errMsg = (label != '' ? label :'删除') + '失败',
  okData = {},
  errData = {}
}) => {
  connection.query(mysqlClient.format(sql, param), (err, result) => {
    console.log('SQL语句：' + mysqlClient.format(sql, param));
    console.log("mysql错误：" + err);
    if (err) printErrorCode(res, 'sql', 302)
    else {
      if (result.affectedRows > 0) {
        var rtnData = {
          code: 200,
          msg: okMsg,
          data: okData,
          timestamps: Date.now()
        }
        if (cbSQL) {
          cbSQL(err, result, rtnData);
        } else {
          res.json(rtnData)
        }
      } else {
        res.json({
          code: 332,
          msg: errMsg,
          data: errData,
          timestamps: Date.now()
        });
      }
    }
  })
}

export default connection;