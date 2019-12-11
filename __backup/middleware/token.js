"use strict"
import Token from './../service/token';
import {sqlQueryWithParam} from  './../service/mysql';

export default function (req, res, next) {
    let token = req.headers.authorization;
    let tokenResult = Token.verifyToken(token);
    if (tokenResult.code != 200) {
        req.session.user_id = null;
        res.status(403).send(tokenResult);
    } else {
        req.session.user_id = tokenResult.userid;
        next();
    }
}

export function adminToken (req, res, next) {
    let token = req.headers.authorization;
    let tokenResult = Token.verifyToken(token);
    if (tokenResult.code != 200) {
        req.session.user_id = null;
        res.status(403).send(tokenResult);
    } else {
        var sql = `select count(user_admin) as isAdmin from user_status 
                    where user_id = ? and deleted = 0 and
                    user_id in (select distinct(user_id) from user_info)`;
        sqlQueryWithParam(sql,[tokenResult.userid],true).then(r=>{
            if( r.isAdmin === 1){
                req.session.user_id = tokenResult.userid;
                next();
            }else{
                res.status(500).send({code:503,msg:'对不起, 你没有权限访问'})
            }
        })

    }
}
export function set_session_user_id(req,res,next){
    let token = req.headers.authorization;
    let tokenResult = Token.verifyToken(token);
    if (tokenResult.code != 200) {
        req.session.user_id = null;
        next();
    } else {
        req.session.user_id = tokenResult.userid;
        next();
    }
}