"use strict"
import {
  dateFormat,
  md5,
  randomCode,
  postDataCheck,
  isNullVal,
  printErrorCode
} from './../../utils/func'
import {
  sqlQueryWithParam,
  sqlQuery
} from './../../service/mysql'
import formidable from 'formidable';
import async from 'async';
import sizeOf from 'image-size'
import {
  extname,
  basename
} from 'path'
import fs from 'fs'
import webp from 'webp-converter'
import path from 'path'

exports.img = function (req, res) {
  let form = new formidable.IncomingForm()
  let uploadFileList = []
  form.uploadDir = 'uploads/tmp';
  form.on('file', function (filed, file) {
    uploadFileList.push(file);
  });
  form.parse(req, function (err, fields, files) {
    if (err) res.json(printErrorCode(res, 'upload', 401));

    async.map(uploadFileList, function (el, cb) {
      let distPath = 'uploads' + path.sep + md5((Date.now()) + el.size + el.name) + extname(el.name);
      fs.rename(el.path, distPath, err => {
        if (err) res.json(err);
        webp.cwebp(distPath, distPath + '.webp', "-q 80", (status) => {
          let info = {
            path: basename(distPath),
            hasWebp: status == 100,
          }
          try {
            info = Object.assign(info, sizeOf(distPath))
          } catch (e) {
            info.size = el.size
          }
          cb(null, info)
        })
      })
    }, function (errCode, result) {
      if (errCode) res.json(printErrorCode(res, 'upload', 401))
      res.json({
        msg: '上传成功!',
        code: 200,
        data: result
      })
    })
  })
}
