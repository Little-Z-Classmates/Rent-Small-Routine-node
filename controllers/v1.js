/**
 *@作者 : 小Z同学
 *@TheFileFunction ：
 *@CreatedDate : 2019/5/9
 **/

// 导入 mysql 链接池
const mysqlConnection = require ( "../mysql/mysqlDB.js" )
const fs = require("fs");

async  function advertisement ( req ,res ) {
    var sql = "select * from advertisement where isshow = 'true'"
    mysqlConnection.query(sql,function ( error, results ) {
        if ( error ){
            console.log ( error )
            res.json(error)
            return false
        }
        var adList = []
        results.forEach( item =>{
            // 图片
            var adBackStageImgsPath = (item.adbackstageimgspath).split('@')
            // 文章
            var adArticle = fs.readFileSync(item.adarticlepath,'utf-8').toString();
            var oldAdArticleList = adArticle.split('@')
            var newAdArticleList = []
            oldAdArticleList.forEach( item =>{
                var arr = item.split('&')
                newAdArticleList.push(arr)
            })
            var adObj = {
                id : item.adid,
                adName : item.adname,
                adFrontImgPath: item.adfrontimgpath,
                adBackStageImgsPath: adBackStageImgsPath,
                newAdArticleList : newAdArticleList
            }
            adList.push(adObj)
        })
        res.json(adList)
    })
}

async  function addRentHouseInfo ( req ,res ) {
    var openid  = req.body.openid
    var houseid = req.body.houseid
    var setSubmitMode = req.body.setSubmitMode

    if ( setSubmitMode == 'img'){
        // 得到文件后缀
        var suffix  = ( req.file.mimetype.split('/') )[1]
        // 得到图片类型 : 封面 还是 其他图片
        var imgMode =  req.body.imgMode
        // 得到保存到 img 文件夹的 文件名
        if ( imgMode == 'cover' ){
            // 封面 为 openid_houseid_cover
            var newImgName = openid + "@@" + houseid + "@@" + imgMode
            var newPath = 'public/img/' + newImgName + '.' + suffix

            var toggleSql = `select * from userhouse where houseid = '${houseid}'`
            mysqlConnection.query(toggleSql)
            .then( res =>{
                if ( res.results.length == 0 ){
                    var addSql = `insert into userhouse( openid,houseid,houseFrontCoverImgPath ) value ('${openid}','${houseid}','${newPath}')`
                    return mysqlConnection.query(addSql)
                }else{
                    var updateSql =`update userhouse  set  houseFrontCoverImgPath = '${newPath}' where houseid = '${houseid}' `
                    return mysqlConnection.query(updateSql)
                }
            })

            // 图片改名
            fs.renameSync('public/img/' + req.file.filename, newPath )
            res.end("上传封面成功")
        } else if( req.body.imgMode == 'other' ){
            // 其他图片为 openid_houseid_other_index
            var index = req.body.index
            var newImgName = openid + "@@" + houseid + "@@" + imgMode + "@@" + index
            var newPath = 'public/img/' + newImgName + '.' + suffix
            // 其他图片信息
            var otherImgInfo = JSON.parse( req.body.otherImgInfo )
            otherImgInfo.imgPath = newPath

            var toggleSql = `select * from userhouse where houseid = '${houseid}'`
            mysqlConnection.query(toggleSql)
            .then( res =>{
                if ( res.results.length == 0 ){
                    var arr = []
                    arr.push(otherImgInfo)
                    var arrStr = JSON.stringify(arr)
                    var addSql = `insert into userhouse( openid,houseid,houseOtherImgListInfo ) value ('${openid}','${houseid}','${arrStr}')`
                    mysqlConnection.query(addSql)
                } else{
                    var getHouseOtherImgListInfoSql = `select houseOtherImgListInfo from userhouse where houseid = '${houseid}'`
                    mysqlConnection.query(getHouseOtherImgListInfoSql)
                    .then( res =>{
                        var houseOtherImgListInfo = JSON.parse( res.results[0].houseOtherImgListInfo ) || []
                        houseOtherImgListInfo.push( otherImgInfo )
                        var houseOtherImgListInfoStr = JSON.stringify( houseOtherImgListInfo )
                        var updateInfoSql = `update userhouse set  houseOtherImgListInfo = '${houseOtherImgListInfoStr}' where houseid = '${houseid}'`
                        mysqlConnection.query( updateInfoSql )
                    })
                }
            } )
            // 图片改名
            fs.renameSync('public/img/' + req.file.filename, newPath )
            res.end("上传其他图片成功")
        }
    }
    else{
        var selectSql = `select * from userhouse where houseid = '${houseid}'`
        mysqlConnection.query( selectSql )
        .then( result =>{
            if ( result.results.length == 0 ){
                 var addSql = `insert into userhouse(openid,houseid,mode,placeInfo,room,toilet,acreage,storey,payTime,price,feature,houseDescribeValue,contactWay,publishData)
                               value ('${openid}','${houseid}','${req.body.mode}','${req.body.placeInfo}','${req.body.room}',
                                      '${req.body.toilet}','${req.body.acreage}','${req.body.storey}','${req.body.payTime}','${req.body.price}',
                                      '${req.body.feature}','${req.body.houseDescribeValue}','${req.body.contactWay}','${req.body.publishData}')`
                 mysqlConnection.query(addSql)
            }else{
                var updateSql = `update userhouse  set  
                mode = '${req.body.mode}' , placeInfo = '${req.body.placeInfo}' , room = '${req.body.room}' , toilet = '${req.body.toilet}' ,
                acreage = '${req.body.acreage}' , storey = '${req.body.storey}' , payTime = '${req.body.payTime}' , price = '${req.body.price}' ,
                feature = '${req.body.feature}' , houseDescribeValue = '${req.body.houseDescribeValue}' , contactWay = '${req.body.contactWay}',
                publishData = '${req.body.publishData}'
                where houseid = '${houseid}'`
                mysqlConnection.query(updateSql)
            }
            res.end('房源数据存储完毕')
        })
    }
}

async function houseInfoList ( req ,res ) {
    var openid = req.query.openid
    var getHouseInfoListSql = `select * from userhouse where openid = '${openid}'`
    mysqlConnection.query(getHouseInfoListSql)
    .then( results =>{
        var userInfoList = results.results
        userInfoList.forEach( item =>{
            item.houseOtherImgListInfo = JSON.parse(item.houseOtherImgListInfo)
            item.mode = JSON.parse(item.mode)
            item.placeInfo = JSON.parse(item.placeInfo)
            item.room = JSON.parse(item.room)
            item.toilet = JSON.parse(item.toilet)
            item.acreage = JSON.parse(item.acreage)
            item.storey = JSON.parse(item.storey)
            item.payTime = JSON.parse(item.payTime)
            item.price = JSON.parse(item.price)
            item.feature = JSON.parse(item.feature)
            item.houseDescribeValue = JSON.parse(item.houseDescribeValue)
            item.contactWay = JSON.parse(item.contactWay)
            item.publishData = JSON.parse(item.publishData)
        })
        res.json( userInfoList )
    })
}

async function getHouseDetaileInfo ( req,res ) {
    var openid = req.query.openid
    var houseid = req.query.houseid
    var myOpenid = req.query.myOpenid

    var selectSql = `select * from userhouse where openid='${openid}' and houseid='${houseid}'`
    mysqlConnection.query(selectSql)
    .then( data =>{
        var myData = data.results[0]
        var Obj = {
            openid : myData.openid,
            houseid : myData.houseid,
            houseFrontCoverImgPath: myData.houseFrontCoverImgPath,
            houseOtherImgListInfo: JSON.parse(myData.houseOtherImgListInfo),
            mode: JSON.parse(myData.mode),
            placeInfo: JSON.parse(myData.placeInfo),
            room : JSON.parse(myData.room),
            toilet: JSON.parse(myData.toilet),
            acreage: JSON.parse(myData.acreage),
            storey: JSON.parse(myData.storey),
            payTime: JSON.parse(myData.payTime),
            price: JSON.parse(myData.price),
            feature: JSON.parse(myData.feature),
            houseDescribeValue: JSON.parse(myData.houseDescribeValue),
            contactWay: JSON.parse(myData.contactWay)
        }
        var collectSql = `select collectHouse from user where openid = '${myOpenid}'`
        mysqlConnection.query( collectSql )
        .then( sonData =>{
            var mySonData = sonData.results[0].collectHouse
            if ( mySonData == ''){
                Obj.shoucangFlag = false
                res.json(Obj)
            }else{
                var mySonDataArr = mySonData.split('@@')
                var index = mySonDataArr.findIndex( mySonDataArrItem =>{
                    return ( mySonDataArrItem == houseid )
                })
                if ( index  == -1 ){
                    Obj.shoucangFlag = false
                    res.json(Obj)
                }else{
                    Obj.shoucangFlag = true
                    res.json(Obj)
                }
            }
        })

    })
}

async function collectHouse ( req,res ) {
    var myOpenid = req.query.myOpenid
    var collectHouseid = req.query.collectHouseid
    var collectFlag = JSON.parse(req.query.collectFlag)

    if ( collectFlag ){
        var sql = `select * from user where openid = '${myOpenid}'`
        mysqlConnection.query(sql)
        .then( data =>{
            var results = data.results[0].collectHouse
            if ( results == '' ){
                var updateSql = `update user set collectHouse = '${collectHouseid}' where openid = '${myOpenid}' `
                mysqlConnection.query( updateSql )
                res.json('收藏成功')
            }else{
                results += '@@' + collectHouseid
                var updateSql = `update user set collectHouse = '${results}' where openid = '${myOpenid}' `
                mysqlConnection.query( updateSql )
                res.json('收藏成功')
            }
        })
    }
    else{
        var sql = `select * from user where openid = '${myOpenid}'`
        mysqlConnection.query(sql)
        .then( data =>{
             var results = data.results[0].collectHouse
             var resultsArr = results.split('@@')
             var index = resultsArr.findIndex( item =>{
                 return ( item == collectHouseid )
             })
            resultsArr.splice(index,1)
            if ( resultsArr.length == 0 ){
                var updateSql = `update user  set  collectHouse = '' where openid = '${myOpenid}'`
                mysqlConnection.query(updateSql)
                res.json('取消收藏')
            }else{
                resultsArr = resultsArr.join('@@')
                var updateSql = `update user  set  collectHouse = '${resultsArr}' where openid = '${myOpenid}'`
                mysqlConnection.query(updateSql)
                res.json('取消收藏')
            }
        })
    }
}

async function getCollectHouseList ( req,res ) {
    var openid = req.query.openid
    var collectHouseSql = `select * from user where openid = '${openid}'`
    mysqlConnection.query( collectHouseSql )
    .then( data =>{
        var results = data.results[0].collectHouse
        if ( results == '' ){
            var arr = []
            res.json(arr)
        }
        else{
            var resultsArr = results.split('@@')
            var arr = []
            var end = resultsArr.length-1
            var start = 0
            console.log ( resultsArr )
            var syncFunc = function ( ) {
                var sql = `select * from userhouse where houseid = ${resultsArr[start]}`
                mysqlConnection.query( sql )
                .then( sonData =>{
                    var houseInfo = sonData.results[0]
                    var Obj = {
                        openid : houseInfo.openid,
                        houseid : houseInfo.houseid,
                        houseFrontCoverImgPath : houseInfo.houseFrontCoverImgPath,
                        placeInfo : JSON.parse(houseInfo.placeInfo)
                    }
                    arr.push(Obj)
                    start++
                    if ( start <= end ){
                        syncFunc()
                    }else{
                        res.json(arr)
                    }
                })
            }
            syncFunc()
        }

    })
}

module.exports = {
    advertisement,
    addRentHouseInfo,
    houseInfoList,
    getHouseDetaileInfo,
    collectHouse,
    getCollectHouseList
}