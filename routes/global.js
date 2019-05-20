/**
 *@作者 : 小Z同学
 *@TheFileFunction ：
 *@CreatedDate : 2019/5/3
 **/
const express = require ( "express" )
const router = express.Router ()
const global = require("../controllers/global")

router.get("/login",global.login)

router.get("/getRecommendHouseInfo",global.getRecommendHouseInfo)


module.exports = router

