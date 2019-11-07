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