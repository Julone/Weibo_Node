import mysqlClient from "mysql";
import {printErrorCode} from './../error'

var connection = mysqlClient.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'phantom',
    useConnectionPooling: true,
    // debug:true,
    port:3306
});
connection.connect(function(err) {
  if (err) {
    console.error('mysql连接失败: ' + err);
    return;
  }
  console.log('mysql连接成功 id ' + connection.threadId);
});

export const sqlQuery = (sql) =>{
  return new Promise((resolve,reject)=>{
    connection.query(mysqlClient.format(sql),(err,result) =>{
      console.log('SQL语句：' + mysqlClient.format(sql,param));
      console.log("mysql错误：" + err);
      if(err) reject(err);
      else resolve(result);
    })
  })
}

export const sqlQueryWithParam = (sql,param) =>{
  return new Promise((resolve,reject)=>{
    connection.query(mysqlClient.format(sql,param),(err,result) => {
      console.log('SQL语句：' + mysqlClient.format(sql,param));
      console.log("mysql错误：" + err);
      if(err) reject(err);
      else {
        resolve(JSON.parse(JSON.stringify(result)))
      }
    })
  })
}

export const sqlQueryWithParamCb=(sql,param,cb) => {
  return connection.query(mysqlClient.format(sql,param),(err,result) => {
    console.log('SQL语句：' + mysqlClient.format(sql,param));
    console.log("mysql错误：" + err);
    cb(err,result);
  })
}
export const sqlInsertWithParam = (sql,param,res,{cbSQL = null,okMsg = '记录插入成功！',okData = {}}) =>{
  console.log('SQL语句：' + mysqlClient.format(sql,param));
    connection.query(mysqlClient.format(sql,param),(err,result) => {
      console.log("mysql错误：" + err);
      if(err) printErrorCode(res,'sql',304)
      else {
        if(result.affectedRows >= 1){
          if(cbSQL){
            cbSQL(result.insertId);
          }else{
            res.json({code:200,msg:okMsg,data:okData});
          }
        }else{
          printErrorCode(res,'sql',304)
        }
      }
    })
}
export const sqlUpdateWithParam = (sql,param,res,{okMsg = '更新数据成功',errMsg='更新数据失败',okData = {},errData={}}) =>{
  console.log('SQL语句：' + mysqlClient.format(sql,param));
    connection.query(mysqlClient.format(sql,param),(err,result) => {
      console.log("mysql错误：" + err);
      console.log(result);
      if(err) printErrorCode(res,'sql',310)
      else {
        if(result.changedRows > 0){
            res.json({code:200,msg:okMsg,data:okData});
        }else{
            res.json({code:332,msg:errMsg,data:errData})
        }
      }
    })
}

export const sqlDeleteWithParam = (sql,param,res,cbSQL) =>{
  connection.query(mysqlClient.format(sql,param),(err,result) => {
    console.log('SQL语句：' + mysqlClient.format(sql,param));
    console.log("mysql错误：" + err);
    if(err) printErrorCode(res,'sql',302)
    else {
      if(result.affectedRows >= 1){
        if(cbSQL){
          cbSQL(result.insertId);
        }else{
          res.json({code:200,msg:'记录删除成功！'})
        }
      }else{
        printErrorCode(res,'sql',302)
      }
    }
  })
}

export default connection;