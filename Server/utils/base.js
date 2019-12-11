import { createHash } from "crypto";
import { printErrorCode } from './error'

export function randomCode(len = 6){
    return ('0'.repeat(len) + Math.floor(Math.random() * parseInt('9'.repeat(len)))).slice(-len)
}

export function isJson(str) {
    if (typeof str == 'string') {
        try {
            var obj=JSON.parse(str);
            if(typeof obj == 'object' && obj ){
                return true;
            }else{
                return false;
            }

        } catch(e) {
            return false;
        }
    }
}


export const md5 = (val) => {
    var md5 = createHash('md5')
    return md5.update(val).digest('hex');
}
export const dateFormat = function(fmt)   
{
    var that = this instanceof Date ? this:new Date(this);
    var o = {   
    "M+" : that.getMonth()+1,                 //月份   
    "d+" : that.getDate(),                    //日   
    "h+" : that.getHours(),                   //小时   
    "m+" : that.getMinutes(),                 //分   
    "s+" : that.getSeconds(),                 //秒   
    "q+" : Math.floor((that.getMonth()+3)/3), //季度   
    "S"  : that.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (that.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
}  
function isNullVal(val){
    return _.isNull(val) || _.isUndefined(val);
}

export { isNullVal, printErrorCode}
