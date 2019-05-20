/**
 *@作者 : 小Z同学
 *@TheFileFunction ：
 *@CreatedDate : 2019/5/19
 **/
const express = require ( "express" )
const router = express.Router ()
const multer = require('multer');
const imgUpload = multer({ dest: 'public/img/' });
const v2 = require("../controllers/v2")

// 提供房源信息,让用户修改
router.get('/getHouseInfo',v2.getHouseInfo)

// 修改房屋信息
router.post('/updateHouseInfo',imgUpload.single('publishImg'),v2.updateHouseInfo)

// 删除房屋信息
router.get('/deleteHouseInfo',v2.deleteHouseInfo)

module.exports = router
