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

// 提供房源详细信息
router.get('/getHouseDetaileInfo',v1.getHouseDetaileInfo)

// 添加/删除 收藏的房源id
router.get('/collectHouse',v1.collectHouse)

// 获取收藏的房源
router.get("/getCollectHouseList",v1.getCollectHouseList)

module.exports = router

