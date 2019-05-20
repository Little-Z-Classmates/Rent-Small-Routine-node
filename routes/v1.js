/**
 *@作者 : 小Z同学
 *@TheFileFunction ：
 *@CreatedDate : 2019/5/9
 **/
const express = require ( "express" )
const router = express.Router ()
const multer = require('multer');
const imgUpload = multer({ dest: 'public/img/' });
const v1 = require("../controllers/v1")


// 提供广告信息
router.get('/advertisement',v1.advertisement)

// 添加房屋信息
router.post('/addRentHouseInfo',imgUpload.single('publishImg'),v1.addRentHouseInfo)

// 根据 openid 获取获取用户房源信息
router.get('/houseInfoList',v1.houseInfoList)



module.exports = router

