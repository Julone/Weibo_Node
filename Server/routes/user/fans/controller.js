import {
    sqlQueryWithParam,
    sqlInsertWithParam,
    sqlUpdateWithParam
} from '../../../service/mysql'
import fansListGet from '../_model/fans';

exports.fansListGet = async (req,res) =>{
    return fansListGet({req,res,cb(el){
        res.json(el);
    }})
}

