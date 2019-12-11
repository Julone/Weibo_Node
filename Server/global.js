import path from 'path';
global._ = require('underscore');
_.parseJSON = function(val){
    try{
        return JSON.parse(String(val));
    }catch(e){
        return [];
    }
};
global.printErrorCode = require('./utils/base').printErrorCode;
global.getErrorMsg =  require('./utils/error').getErrorMsg;
global.APP_ROOT = String(path.resolve(__dirname,'../'));
global.SERVER_ROOT = String(path.resolve(__dirname,'./'));
global.ROUTE_ROOT = String(path.resolve(__dirname,'./routes/'));
global.easyPath = (...args) => {
    return path.join.apply(null,args);
};
global.requirePath = (...args)=>{
    return require(easyPath.apply(null,args));
};

import './datalize.config.js';